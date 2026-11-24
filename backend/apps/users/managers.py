from django.contrib.auth.base_user import BaseUserManager


class UserManager(BaseUserManager):
    """
    Handles creating User objects. Overridden because the default
    Django manager expects a `username` field, which we don't have.
    """

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Users must have an email address.')

        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)  # hashes it — never stored as plain text
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)