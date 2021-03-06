from django.urls import path
from .views import CookieTokenRefreshView, CookieTokenObtainPairView, ProfileView, RegisterViewSet, LogoutView, FollowView, SearchViewSet

urlpatterns = [
    path('auth/login/', CookieTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/login/refresh/', CookieTokenRefreshView.as_view(), name='token_refresh'),
    path('auth/logout/', LogoutView.as_view(), name='user_logout'),
    path('auth/register/', RegisterViewSet.as_view({'post': 'create'}), name='user_register'),
    path(r'profiles/search/', SearchViewSet.as_view({'get': 'list'})),
    path(r'profiles/<str:username>/', ProfileView.as_view({'get': 'details'}), name='user_profile'),
    path(r'profiles/<str:username>/follow/', FollowView.as_view({'post': 'follow', 'delete': 'unfollow'})),
]
