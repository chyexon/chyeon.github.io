document.addEventListener('DOMContentLoaded', function() {
  const stationList = document.getElementById('stationList');
  const searchButton = document.getElementById('searchButton');
  const searchInput = document.getElementById('search');

  let allStations = [];

  function fetchData() {
    fetch('/api/65795863777a7866313034455a74584f/json/tbCycleStationInfo/1/100/')
      .then(response => response.json())
      .then(data => {
        if (data && data.stationInfo && data.stationInfo.row) {
          allStations = data.stationInfo.row;
          displayStations(allStations);
        }
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        stationList.innerHTML = '데이터를 불러오는 데 실패했습니다.';
      });
  }

  function displayStations(stations) {
    stationList.innerHTML = '';
    stationList.style.display = 'block';

    stations.forEach(station => {
      const stationItem = document.createElement('div');
      stationItem.classList.add('station');
      stationItem.style.margin = '10px 0';

      stationItem.innerHTML = `
        <strong>${station.RENT_NM}</strong><br>
        ${station.STA_ADD1}<br>
        <button class="detailsButton" data-id="${station.RENT_ID}">상세보기</button>
        <div class="stationDetails" style="display: none;" id="details-${station.RENT_ID}">
        </div>
      `;
      stationList.appendChild(stationItem);
    });

    const detailsButtons = document.querySelectorAll('.detailsButton');
    detailsButtons.forEach(button => {
      button.addEventListener('click', function() {
        const stationId = this.getAttribute('data-id');
        const selectedStation = stations.find(station => station.RENT_ID === stationId);
        const detailsDiv = document.getElementById(`details-${stationId}`);
        
        if (detailsDiv.style.display === 'none' || detailsDiv.style.display === '') {
          detailsDiv.style.display = 'block';
          detailsDiv.innerHTML = `
            <div class="stationDetailBox">
              <strong>대여소 이름:</strong> ${selectedStation.RENT_NM}<br>
              <strong>위치:</strong> ${selectedStation.STA_ADD1}<br>
              <strong>대여 가능 대수:</strong> ${selectedStation.HOLD_NUM}<br>
            </div>
          `;
        } else {
          detailsDiv.style.display = 'none';
        }
      });
    });
  }

  if (searchButton) {
    searchButton.addEventListener('click', function() {
      const searchTerm = searchInput.value.toLowerCase();
      const filteredStations = allStations.filter(station => {
        return station.RENT_NM.toLowerCase().includes(searchTerm) || station.STA_ADD1.toLowerCase().includes(searchTerm);
      });
      displayStations(filteredStations);
    });
  }

  fetchData();
});
