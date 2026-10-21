from rest_framework import serializers


class CodeField(serializers.CharField):
    def to_internal_value(self, value):
        if not isinstance(value, str):
            raise serializers.ValidationError('Code must be a string.')
        if not value.strip():
            raise serializers.ValidationError('Please enter some code to explain.')
        return super().to_internal_value(value)


class ExplainSerializer(serializers.Serializer):
    code = CodeField(max_length=6000, trim_whitespace=False, error_messages={
        'required': 'Code is required.',
        'blank': 'Please enter some code to explain.',
        'null': 'Code must be a string.',
        'max_length': 'Code must be at most 6000 characters.',
    })
    level = serializers.ChoiceField(choices=['beginner', 'intermediate'])
    language = serializers.ChoiceField(
        choices=['auto', 'python', 'javascript', 'sql', 'java', 'cpp', 'html/css'],
        default='auto',
    )
