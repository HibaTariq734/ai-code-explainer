"""Check deployment settings without reading or changing the developer's .env."""
import os
import runpy
from pathlib import Path
from unittest import TestCase
from unittest.mock import patch
from django.core.exceptions import ImproperlyConfigured


class DeploymentSettingsTests(TestCase):
    def load_settings(self, environment):
        with patch.dict(os.environ, environment, clear=True), patch('dotenv.load_dotenv'):
            return runpy.run_path(str(Path(__file__).with_name('settings.py')))

    def test_missing_production_secret_fails(self):
        # DEBUG defaults to False, so an unconfigured deployment must not start.
        with self.assertRaisesRegex(ImproperlyConfigured, 'SECRET_KEY'):
            self.load_settings({})
        with self.assertRaisesRegex(ImproperlyConfigured, 'SECRET_KEY'):
            self.load_settings({'DEBUG': 'False', 'SECRET_KEY': '  '})

    def test_development_fallback_and_default_origins(self):
        settings = self.load_settings({'DEBUG': ' True '})
        self.assertTrue(settings['DEBUG'])
        self.assertTrue(settings['SECRET_KEY'])
        self.assertEqual(settings['ALLOWED_HOSTS'], ['localhost', '127.0.0.1', '.vercel.app'])
        self.assertEqual(settings['CORS_ALLOWED_ORIGINS'], [
            'http://localhost:5173', 'http://127.0.0.1:5173',
        ])

    def test_environment_lists_and_explicit_production_secret(self):
        settings = self.load_settings({
            'SECRET_KEY': 'test-only-production-configuration-key',
            'ALLOWED_HOSTS': ' code-explainer.onrender.com, api.example.com, ',
            'CORS_ALLOWED_ORIGINS': ' https://app.example.com, http://localhost:5173, ',
        })
        self.assertFalse(settings['DEBUG'])
        self.assertEqual(settings['SECRET_KEY'], 'test-only-production-configuration-key')
        self.assertEqual(settings['ALLOWED_HOSTS'], ['code-explainer.onrender.com', 'api.example.com'])
        self.assertEqual(settings['CORS_ALLOWED_ORIGINS'], [
            'https://app.example.com', 'http://localhost:5173',
        ])

    def test_serverless_settings_disable_database_access(self):
        settings = self.load_settings({'DEBUG': 'True'})
        self.assertEqual(settings['DATABASES']['default']['ENGINE'], 'django.db.backends.dummy')
        self.assertNotIn('django.contrib.auth', settings['INSTALLED_APPS'])
        self.assertNotIn('django.contrib.sessions', settings['INSTALLED_APPS'])

    def test_vercel_exposes_the_wsgi_application(self):
        from config.wsgi import app, application
        self.assertIs(app, application)
        self.assertTrue(callable(app))
