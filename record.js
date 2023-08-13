
      // API 호출 및 표 생성
      fetch("/getRecords")
        .then((response) => response.json())
        .then((records) => {
          const table = document.getElementById("recordTable");

          records.forEach((record) => {
            const row = table.insertRow();
            row.insertCell().textContent = record.win;
            row.insertCell().textContent = record.wscore;
            row.insertCell().textContent = record.lose;
            row.insertCell().textContent = record.lscore;
            row.classList.add("table-row");

          });
        })
        .catch((error) => console.error("Error fetching records:", error));