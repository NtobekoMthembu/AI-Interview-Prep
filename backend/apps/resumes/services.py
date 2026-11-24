import pdfplumber
import docx

from django.utils import timezone


class ResumeParsingError(Exception):
    """Raised when a resume's text genuinely can't be extracted —
    e.g. a scanned image PDF with no real text layer, or a corrupted file."""


class ResumeParserService:
    """Extracts plain text from an uploaded CV file (PDF or DOCX)."""

    @staticmethod
    def extract_text(resume) -> str:
        filename = resume.file.name.lower()

        if filename.endswith('.pdf'):
            text = ResumeParserService._extract_pdf(resume.file)
        elif filename.endswith('.docx'):
            text = ResumeParserService._extract_docx(resume.file)
        else:
            raise ResumeParsingError(f'Unsupported file type: {filename}')

        text = text.strip()
        if not text:
            raise ResumeParsingError(
                'No readable text found in this file. It may be a scanned '
                'image without a text layer — try uploading another PDF or DOCX file.'
            )

        return text

    @staticmethod
    def _extract_pdf(file) -> str:
        file.seek(0)
        pages_text = []
        try:
            with pdfplumber.open(file) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        pages_text.append(page_text)
        except Exception as exc:
            raise ResumeParsingError(f'Could not read this PDF: {exc}') from exc

        return '\n\n'.join(pages_text)

    @staticmethod
    def _extract_docx(file) -> str:
        file.seek(0)
        try:
            document = docx.Document(file)
        except Exception as exc:
            raise ResumeParsingError(f'Could not read this DOCX file: {exc}') from exc

        return '\n'.join(p.text for p in document.paragraphs if p.text.strip())

    @staticmethod
    def extract_and_store(resume) -> str:
        """Extracts text and saves it onto the resume row, so future
        callers can read resume.extracted_text without re-parsing."""
        text = ResumeParserService.extract_text(resume)
        resume.extracted_text = text
        resume.text_extracted_at = timezone.now()
        resume.save(update_fields=['extracted_text', 'text_extracted_at'])
        return text