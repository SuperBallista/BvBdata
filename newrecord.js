

const winnerSelect = document.getElementById('winner');

// 승자 목록 가져오기
fetch('/get_winners', {
    method: 'GET',
})
.then(response => response.json())
.then(data => {
    data.winners.forEach(winner => {
        const option = document.createElement('option');
        option.value = winner;
        option.textContent = winner;
        winnerSelect.appendChild(option);
    });
})
.catch(error => {
    console.error('Error fetching winners:', error);
});

// 승자 목록 가져오기 끝


// 미승인 게임 불러오기


const scoreTable = document.querySelector('.score-table');
let accessToken = localStorage.getItem('accessToken'); // 로그인 토큰 가져오기
if (accessToken) {
    fetch('/get_scores', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}` // 토큰을 헤더에 추가
        }
    })
    .then(response => response.json())
    .then(data => {
console.log(data.scores)



        data.scores.forEach(score => {
            const row = scoreTable.insertRow();
            const cell1 = row.insertCell(0);
            const cell2 = row.insertCell(1);
            const cell3 = row.insertCell(2);
            const cell4 = row.insertCell(3);

            cell1.textContent = score.winning_score;
            cell2.textContent = score.loser;
            cell3.textContent = score.losing_score;

            const actionButtons = document.createElement('div');
            actionButtons.className = 'action-buttons';

            const approvalButton = document.createElement('button');
            approvalButton.textContent = '승인';
            approvalButton.className = 'approval-button';

            const cancelButton = document.createElement('button');
            cancelButton.textContent = '취소';
            cancelButton.className = 'cancel-button';

            actionButtons.appendChild(approvalButton);
            actionButtons.appendChild(cancelButton);
            cell4.appendChild(actionButtons);
        });
    })
    .catch(error => {
        console.error('Error fetching scores:', error);
    });
}

// 미승인 게임 불러오기 끝


// 대전 경기 보내기

document.addEventListener('DOMContentLoaded', () => {
    const submitButton = document.getElementById('submitButton');
    const winnerSelect = document.getElementById('winner');
    const winnerScoreInput = document.getElementById('winnerScore');
    const myScoreInput = document.getElementById('myScore');

    submitButton.addEventListener('click', async (e) => {
        e.preventDefault();

        const winner = winnerSelect.value;
        const winnerScore = winnerScoreInput.value;
        const myScore = myScoreInput.value;
        
        const accessToken = localStorage.getItem('accessToken');

        const requestBody = {
            winname: winner,
            winscore: winnerScore,
            myScore2: myScore
        };

        const headers = new Headers({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        });
        
        try {
            const response = await fetch('/submitbr', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(requestBody)
            });
        
            if (response.ok) { // 응답 상태 코드가 200 (OK)일 때
                const responseData = await response.json();
                alert('데이터를 성공적으로 보냈습니다')
                location.reload();

            } else {
                console.error('Error sending data:', response.statusText);
                alert('Error sending data. Please try again.');
            }
        } catch (error) {
            console.error('Error sending data:', error);
            alert('Error sending data. Please try again.');
        }
        
        
        
    });
});
