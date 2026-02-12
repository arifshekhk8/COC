from django.contrib.auth.models import User
from rest_framework import serializers


class UserSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    picture = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "email", "name", "picture", "date_joined"]

    def get_name(self, obj: User) -> str:
        return obj.get_full_name() or obj.username

    def get_picture(self, obj: User) -> str:
        profile = getattr(obj, "profile", None)
        return profile.avatar_url if profile else ""
