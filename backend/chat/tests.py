"""Mock the provider so validation and streaming tests never use a real key."""
from types import SimpleNamespace
from unittest.mock import patch
from django.test import SimpleTestCase
from rest_framework.test import APIClient
from groq import RateLimitError, AuthenticationError, NotFoundError, APIConnectionError
import httpx

class ExplainTests(SimpleTestCase):
    def setUp(self):
        self.client = APIClient()

    def post(self, payload):
        return self.client.post('/api/explain/', payload, format='json')

    def test_invalid_code_and_level(self):
        invalid = [{}, {'code': None}, {'code': ''}, {'code': '   '},
                   {'code': 123}, {'code': ['print(1)']}, {'code': 'a' * 6001},
                   {'code': 'print(1)', 'level': 'advanced'},
                   {'code': 'print(1)', 'level': None}]
        for payload in invalid:
            if 'level' not in payload:
                payload['level'] = 'beginner'
            with self.subTest(payload=str(payload)[:60]):
                response = self.post(payload)
                self.assertEqual(response.status_code, 400)
                self.assertTrue(response.data['error'])
                self.assertIn('details', response.data)
        self.assertEqual(self.post({'code': 'print(1)'}).status_code, 400)

    @patch.dict('os.environ', {'GROQ_API_KEY': ''})
    def test_missing_key(self):
        response = self.post({'code': '  print(1)\n', 'level': 'beginner'})
        self.assertEqual(response.status_code, 503)

    @patch.dict('os.environ', {'GROQ_API_KEY': 'test-secret', 'GROQ_MODEL': 'openai/gpt-oss-20b'})
    @patch('chat.views.Groq')
    def test_stream_and_system_prompt(self, groq):
        client = groq.return_value.__enter__.return_value
        stream = client.chat.completions.create.return_value.__enter__.return_value
        stream.__iter__.return_value = iter([SimpleNamespace(choices=[SimpleNamespace(delta=SimpleNamespace(content='Hello\nworld'))])])
        response = self.post({'code': '  print(1)\n', 'level': 'beginner'})
        frames = b''.join(response.streaming_content).decode()
        self.assertIn('Hello\\nworld', frames)
        self.assertIn('"done": true', frames)
        self.assertEqual(client.chat.completions.create.call_args.kwargs['messages'][0]['role'], 'system')
        self.assertEqual(client.chat.completions.create.call_args.kwargs['model'], 'openai/gpt-oss-20b')
        messages = client.chat.completions.create.call_args.kwargs['messages']
        for heading in ['## What it does', '## How it works', '## Output']:
            self.assertIn(heading, messages[0]['content'])
        self.assertNotIn('## 4) One improvement tip', messages[0]['content'])
        self.assertNotIn('Line-by-line explanation', messages[0]['content'])
        self.assertEqual(client.chat.completions.create.call_args.kwargs['max_completion_tokens'], 500)
        self.assertIn('beginner', messages[1]['content'])
        self.assertTrue(messages[1]['content'].endswith('  print(1)\n'))

    @patch.dict('os.environ', {'GROQ_API_KEY': 'test-secret'})
    @patch('chat.views.Groq')
    def test_maximum_length_and_intermediate_level(self, groq):
        response = self.post({'code': 'a' * 6000, 'level': 'intermediate'})
        self.assertEqual(response.status_code, 200)
        list(response.streaming_content)
        client = groq.return_value.__enter__.return_value
        self.assertIn('intermediate', client.chat.completions.create.call_args.kwargs['messages'][1]['content'])

    def test_chat_endpoint_removed(self):
        self.assertEqual(self.client.post('/api/chat/', {}, format='json').status_code, 404)


    @patch.dict('os.environ', {'GROQ_API_KEY': 'test-secret'})
    @patch('chat.views.Groq')
    def test_provider_error_is_private(self, groq):
        groq.side_effect = RuntimeError('test-secret private stack trace')
        response = self.post({'code': '  print(1)\n', 'level': 'beginner'})
        frames = b''.join(response.streaming_content).decode()
        self.assertIn('"error"', frames)
        self.assertNotIn('test-secret', frames)

    @patch.dict('os.environ', {'GROQ_API_KEY': 'test-secret'})
    @patch('chat.views.Groq')
    def test_rate_limit(self, groq):
        groq.side_effect = RateLimitError('private', response=httpx.Response(429, request=httpx.Request('POST', 'https://example.com')), body=None)
        response = self.post({'code': '  print(1)\n', 'level': 'beginner'})
        self.assertIn('busy', b''.join(response.streaming_content).decode())

    def test_method_and_malformed_json(self):
        self.assertEqual(self.client.get('/api/explain/').status_code, 405)
        self.assertEqual(self.client.post('/api/explain/', '{', content_type='application/json').status_code, 400)

    def test_cors_preflight_for_local_frontends(self):
        for origin in ['http://localhost:5173', 'http://127.0.0.1:5173']:
            with self.subTest(origin=origin):
                response = self.client.options(
                    '/api/explain/', HTTP_ORIGIN=origin,
                    HTTP_ACCESS_CONTROL_REQUEST_METHOD='POST',
                    HTTP_ACCESS_CONTROL_REQUEST_HEADERS='content-type',
                )
                self.assertEqual(response.status_code, 200)
                self.assertEqual(response['Access-Control-Allow-Origin'], origin)

    @patch.dict('os.environ', {'GROQ_API_KEY': 'test-secret'})
    @patch('chat.views.Groq')
    def test_provider_configuration_errors_are_actionable(self, groq):
        request = httpx.Request('POST', 'https://example.com')
        errors = [
            (AuthenticationError('private', response=httpx.Response(401, request=request), body=None), 'API key'),
            (NotFoundError('private', response=httpx.Response(404, request=request), body=None), 'model availability'),
            (APIConnectionError(request=request), 'internet connection'),
        ]
        for error, expected in errors:
            with self.subTest(error=type(error).__name__):
                groq.side_effect = error
                response = self.post({'code': '  print(1)\n', 'level': 'beginner'})
                frames = b''.join(response.streaming_content).decode()
                self.assertIn(expected, frames)
                self.assertNotIn('private', frames)
                self.assertNotIn('test-secret', frames)

    def test_cors_does_not_allow_unknown_origin(self):
        response = self.client.options(
            '/api/explain/', HTTP_ORIGIN='https://example.com',
            HTTP_ACCESS_CONTROL_REQUEST_METHOD='POST',
        )
        self.assertNotIn('Access-Control-Allow-Origin', response)

    def test_invalid_language(self):
        for language in ['ruby', '', None, 123, [], {}]:
            with self.subTest(language=language):
                response = self.post({'code': 'print(1)', 'level': 'beginner', 'language': language})
                self.assertEqual(response.status_code, 400)
                self.assertIn('language', response.data['details'])

    @patch.dict('os.environ', {'GROQ_API_KEY': 'test-secret'})
    @patch('chat.views.Groq')
    def test_optional_language_and_prompt_context(self, groq):
        from chat.views import SYSTEM_PROMPT
        choices = [('python', 'Python'), ('javascript', 'JavaScript'), ('sql', 'SQL'),
                   ('java', 'Java'), ('cpp', 'C++'), ('html/css', 'HTML/CSS'),
                   ('auto', None), (None, None)]
        for value, label in choices:
            with self.subTest(language=value):
                payload = {'code': '  example\n', 'level': 'beginner'}
                if value is not None:
                    payload['language'] = value
                response = self.post(payload)
                self.assertEqual(response.status_code, 200)
                frames = b''.join(response.streaming_content).decode()
                self.assertIn('"done": true', frames)
                client = groq.return_value.__enter__.return_value
                messages = client.chat.completions.create.call_args.kwargs['messages']
                if label:
                    self.assertIn(f'The supplied code is in {label}.', messages[0]['content'])
                else:
                    self.assertEqual(messages[0]['content'], SYSTEM_PROMPT)
                self.assertTrue(messages[1]['content'].endswith('  example\n'))
