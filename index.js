

fetch("/getRankings")
  .then((response) => response.json())
  .then((rankings) => {
    const table = document.getElementById("rankingTable");

    rankings.forEach((rank) => {
      const row = table.insertRow();
      row.insertCell().textContent = rank.rade;
      row.insertCell().textContent = rank.name;
      row.insertCell().textContent = rank.tscore;
      row.insertCell().textContent = rank.bscore;
      row.insertCell().textContent = rank.win;
      row.insertCell().textContent = rank.lose;
    });
  })
  .catch((error) => console.error("Error fetching rankings:", error));


  

