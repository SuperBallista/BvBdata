document.addEventListener('DOMContentLoaded', () => {
    const accessToken = localStorage.getItem('accessToken');
    const logoutLink = document.querySelector('.nav__logout-link');

    if (accessToken) {
        // 토큰이 있는 경우: 로그인된 상태이므로 'logouted' 클래스가 있는 요소 숨김
        const logoutedElements = document.querySelectorAll('.nav__logouted');
        logoutedElements.forEach(element => {
            element.style.display = 'none';
        });

        fetch('/get_nickname', {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        })
        .then(response => response.json())
        .then(data => {
            const loginNicknameElements = document.querySelectorAll('.nav__login-nickname');
            loginNicknameElements.forEach(element => {
                console.log = data.nickname;
                element.textContent = data.nickname ;
            });
        })
        .catch(error => {
            console.error('Error fetching nickname:', error);
        });
    } else {
        // 토큰이 없는 경우: 로그인되지 않은 상태이므로 'logined' 클래스가 있는 요소 숨김
        const loginedElements = document.querySelectorAll('.nav__logined');
        loginedElements.forEach(element => {
            element.style.display = 'none';
        });
    }

    // 로그아웃 링크 클릭 시 처리
    logoutLink.addEventListener('click', () => {
        // 토큰 삭제
        localStorage.removeItem('accessToken');

        // 페이지 새로고침
        location.reload();
    });
});
