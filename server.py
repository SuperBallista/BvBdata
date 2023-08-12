from django.db import connection
from django.http import JsonResponse



DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'BvBdata',
        'USER': 'root',
        'PASSWORD': 'F4u@corsair',
        'HOST': 'localhost',
        'PORT': '3000',
    }
}

def check_nickname(request, nickname):
    with connection.cursor() as cursor:
        sql = 'SELECT COUNT(*) AS count FROM yourapp_member WHERE name = %s'
        cursor.execute(sql, [nickname])
        count = cursor.fetchone()[0]
        
        return JsonResponse({'exists': count > 0})

