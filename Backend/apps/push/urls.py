from django.urls import path

from . import views

urlpatterns = [
    path("subscribe/", views.PushSubscribeView.as_view(), name="push-subscribe"),
    path("test/", views.push_test, name="push-test"),
]
