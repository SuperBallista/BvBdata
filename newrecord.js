let uncheckedid = [];

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
        console.dir(data.scores);

        data.scores.forEach((score, index) => {
            const row = scoreTable.insertRow();
            const cell1 = row.insertCell(0);
            const cell2 = row.insertCell(1);
            const cell3 = row.insertCell(2);
            const cell4 = row.insertCell(3);
            row.classList.add("table-row");


            cell1.id = `winscore${index}`;
            cell2.id = `loser${index}`;
            cell3.id = `losescore${index}`;
            cell4.id = `button${index}`;

            uncheckedid.push(score.id);

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


    // 클로저 내부에서 score의 uncheckedid를 참조하여 사용


    approvalButton.addEventListener('click', (event) => {
        const aclickedId = uncheckedid[index]; // 해당 행의 uncheckedid 값을 저장

        // 서버로 데이터를 전송
        fetch('/approvecord', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                approvecord: aclickedId // 해당 행의 uncheckedid를 서버로 전송
            }
            )
        }
            )
        .then(response => {
            if (response.ok) {
                alert("기록을 승인하였습니다")
                location.reload(); // 요청이 성공했을 때에만 새로고침
            } else {
                alert("기록에 실패하였습니다. 다시 시도해주세요.")
                console.error('Record add failed');
            }
        })
        .catch(error => {
            console.error('Error during record add:', error);
        });
    });

    cancelButton.addEventListener('click', (event) => {
        const clickedId = uncheckedid[index]; // 해당 행의 uncheckedid 값을 저장

        console.dir(clickedId);
        // 서버로 데이터를 전송
        fetch('/removerecord', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                removerecord: clickedId // 해당 행의 uncheckedid를 서버로 전송
            }
            )
        }
)
        .then(response => {
            if (response.ok) {
                location.reload(); // 요청이 성공했을 때에만 새로고침
            } else {
                console.error('Record deletion failed');
            }
        })
        .catch(error => {
            console.error('Error during record deletion:', error);
        });
    });




            actionButtons.appendChild(approvalButton);
            actionButtons.appendChild(cancelButton);
            cell4.appendChild(actionButtons);
        });
    });
};


// 대전 경기 보내기 부분 수정됨
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
    
        // 입력값 검사
    
        if (myScore < 0 || myScore > 4) {
            alert('점수는 0 ~ 4까지만 입력이 가능합니다');
            return;
        }
    
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
                alert('데이터를 성공적으로 보냈습니다');
                location.reload();
            } else {
                console.error('Error sending data:', response.statusText);
                alert('잘못된 입력 혹은 서버 에러입니다.');
            }
        } catch (error) {
            console.error('Error sending data:', error);
            alert('잘못된 입력 혹은 서버 에러입니다.');
        }
    });
    

});




// 비로그인 시에 기능 감추기

if (accessToken) {    
const show3 = document.querySelectorAll('.msglogin');
show3.forEach(element => {
  element.style.display = 'none';
});

}
else
{    const show1 = document.querySelectorAll('.new-record');
const show2 = document.querySelectorAll('.record-approve');

show1.forEach(element => {
  element.style.display = 'none';
});

show2.forEach(element => {
  element.style.display = 'none';
});

};

// 비로그인 시에 기능 감추기 끝
