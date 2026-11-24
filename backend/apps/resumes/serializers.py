from rest_framework import serializers
from .models import Resume

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

# The first few bytes of a file are a reliable fingerprint of its real
# type, regardless of what extension it was given. This is what "don't
# trust the extension alone" actually looks like in code.
FILE_SIGNATURES = {
    b'%PDF': 'pdf',
    b'PK\x03\x04': 'docx',  # .docx files are actually zip archives internally
}


class ResumeUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resume
        fields = ['id', 'file', 'original_filename', 'file_size', 'created_at']
        read_only_fields = ['id', 'original_filename', 'file_size', 'created_at']

    def validate_file(self, file):
        if file.size > MAX_FILE_SIZE:
            raise serializers.ValidationError(
                f'File is too large, please compress your file. Maximum size is {MAX_FILE_SIZE // (1024 * 1024)}MB.'
            )

        # Read just the first few bytes to check the real file signature,
        # then reset the pointer so Django can still save the whole file
        # afterward — otherwise we'd accidentally save a truncated file.
        header = file.read(4)
        file.seek(0)

        is_valid_type = any(header.startswith(sig) for sig in FILE_SIGNATURES)
        if not is_valid_type:
            raise serializers.ValidationError(
                'File does not appear to be a valid PDF or DOCX file.'
            )

        return file

    def create(self, validated_data):
        file = validated_data['file']
        return Resume.objects.create(
            user=self.context['request'].user,
            file=file,
            original_filename=file.name,
            file_size=file.size,
        )