
const checkNicknameBtn = document.getElementById("checkNicknameBtn");
const nicknameInput = document.getElementById("nickname");
const messageOutput = document.getElementById("messageOutput");
const submitButton = document.getElementById("member-submitButton")

function checkNickname() {
  const nickname = nicknameInput.value;

  // AJAX 요청으로 닉네임 중복 여부 확인
  fetch(`/checkNickname/${nickname}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.exists) {
        messageOutput.textContent = "이미 사용 중인 닉네임입니다.";
      } else if(data.nickname = 'No One Use it') {
        messageOutput.textContent = "사용 가능한 닉네임입니다.";
        submitButton.disabled = false;
        nicknameInput.readOnly = true;
        checkNicknameBtn.disabled = true;
      }
    })
}

checkNicknameBtn.addEventListener("click", checkNickname);