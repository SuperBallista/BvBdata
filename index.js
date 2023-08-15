fetch("/getRankings")
  .then((response) => response.json())
  .then((rankings) => {

    const table_moblie = document.getElementById("rankingTable-portrait");
    const table = document.getElementById("rankingTable");

    rankings.forEach((rank) => {
      const row_mobile = table_moblie.insertRow();
      row_mobile.insertCell().textContent = rank.name;
      row_mobile.insertCell().textContent = rank.tscore;
      row_mobile.classList.add("table-row"); // Added this line to add the class

      const row = table.insertRow();
      row.insertCell().textContent = rank.rade; 
      row.insertCell().textContent = rank.name;
      row.insertCell().textContent = rank.tscore;
      row.insertCell().textContent = rank.bscore;
      row.insertCell().textContent = rank.win;
      row.insertCell().textContent = rank.lose;
      row.classList.add("table-row"); // Added this line to add the class
    });
  })
  .catch((error) => console.error("Error fetching rankings:", error));
