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
const accessToken = localStorage.getItem('accessToken'); // 로그인 토큰 가져오기
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


