window.onload = function() {
    getEvent();
    registerServiceWorker();
};

const url = "https://openapi.seoul.go.kr:8088/65795863777a7866313034455a74584f/json/culturalEventInfo/1/1000";

let dataDiv = document.getElementById("dataDiv");
let watchButton = document.getElementById("what");
let gu = document.getElementById("gu");

async function getEvent() {
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        let eventList = data.culturalEventInfo.row;
        let gus = gu.options[gu.selectedIndex].value;

        dataDiv.innerHTML = ""; // 이전 데이터 초기화

        for (let i = 0; i < eventList.length; i++) {
            if (gus === eventList[i].CODENAME) {
                const div = document.createElement("div");
                div.setAttribute("class", "dataItem");
                div.innerHTML = `
                    <div class="card" style="width: 18rem;">
                        <img class="card-img-top" src="${eventList[i].MAIN_IMG}">
                        <div class="card-body">
                            <h5 class="card-title">${eventList[i].TITLE}</h5>
                            <p class="card-text">
                                공연기간: ${eventList[i].DATE}<br>
                                공연장: ${eventList[i].PLACE}
                            </p>
                            <a href="${eventList[i].ORG_LINK}" target="_blank" class="btn btn-primary">홈페이지 바로가기</a>
                        </div>
                    </div>
                `;
                dataDiv.appendChild(div);
            }
        }
    } catch (error) {
        console.error("Error fetching the event data:", error);
        dataDiv.innerHTML = `<p class="text-danger">데이터를 불러오는 데 실패했습니다. 다시 시도해주세요.</p>`;
    }
}


watchButton.addEventListener("click", () => {
    getEvent();
});

function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('service-worker.js')
            .then(() => console.log("Service Worker Registered"))
            .catch(error => console.log("Service Worker Registration Failed", error));
    }
}