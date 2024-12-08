window.onload = function () {
    handleRefresh();
};

var map;
var gus="";
var marker;
var mapContainer;
var lat, lng;

function handleRefresh() {
    getData();
    addBound(3000);
}

proxyUrl = "https://cors-anywhere-49h7.onrender.com/"
const apiKey = "65795863777a7866313034455a74584f";
const baseUrl = "http://openAPI.seoul.go.kr:8088/";
const url = `${baseUrl}${apiKey}/json/SeoulPublicLibraryInfo/`;
async function getData() {
    for (var i = 1; i < 16000; i = i + 1000) {
        var j = i + 999;
        await fetch(url + i + "/" + j)
        .then(response => response.json())
        .then(data => updateLibrary(data));
    }
}

function updateLibrary(libraries) {
    console.log('gus:', gus);  // gus 값 확인
    console.log('libraries:', libraries);  // libraries 배열 확인

    // 데이터가 존재하는지 확인
    libraries = libraries.SeoulPublicLibraryInfo?.row || [];
    if (libraries.length === 0) {
        console.log("No libraries found.");
        return;
    }

    var addr = "";
    var center = map.getCenter();
    var position = {
        latitude: center.getLat(),
        longitude: center.getLng()
    };

    for (var i = 0; i < libraries.length; i++) {
        var lib = libraries[i];
        console.log('lib:', lib);  // 각 lib 객체 확인

        var imageSrc = "images/marker1.png",
            imageSize = new daum.maps.Size(27, 40),
            imageOption = {offset: new daum.maps.Point(14, 28)};
        
        var loc = {
            latitude: lib.XCNTS,
            longitude: lib.YDNTS
        };

        var km = computeDistance(position, loc);
        if (addr != lib.ADRES && km <= 3) {
            addr = lib.ADRES;
            addMarker(imageSrc, imageSize, imageOption, lib.XCNTS, lib.YDNTS, lib.LBRRY_NAME, lib.ADRES, lib.TEL_NO, lib.FDRM_CLOSE_DATE);
        }
    }

    var librariesDiv = document.getElementById("libraries");
    librariesDiv.innerHTML = "";

    // 도서관을 리스트에 추가
    for (var i = 0; i < libraries.length; i++) {
        var lib = libraries[i];
        var div = document.createElement("div");
        div.setAttribute("class", "libraries");
        div.innerHTML = "";
        if (lib.CODE_VALUE == gus) {
			div.className = 'row mb-2 ' + (i % 2 === 0 ? 'custom-bg-even' : 'custom-bg-odd');
            div.innerHTML = "[" + lib.CODE_VALUE + "]" + lib.LBRRY_NAME;
            div.innerHTML += "<input type=button style='width: 50px;' value='위치'" +
            "onclick=\"window.open('http://www.google.co.kr/maps/search/" + lib.LBRRY_NAME + " ')\"/>";

            if (lib.TEL_NO != "") {
                div.innerHTML += "<br>" + "☎️) " + lib.ADRES + "(x:" + lib.XCNTS + "&nbsp;,&nbsp;y:" + lib.YDNTS + ")";
            }
            if (lib.FDRM_CLOSE_DATE != "") {
                div.innerHTML += "<br>휴관일: " + lib.FDRM_CLOSE_DATE;
            }
            if (lib.HMPG_URL != "") {
                div.innerHTML += "<br>홈페이지: " + "<a href=" + lib.HMPG_URL + " target=blank>" + lib.HMPG_URL + "</a>";
            }

            if (librariesDiv.childElementCount == 0) {
                librariesDiv.appendChild(div);
            } else {
                librariesDiv.insertBefore(div, librariesDiv.firstChild);
            }
        }
    }
    if (libraries.length > 0) {
        lastReportTime = libraries[libraries.length - 1].time;
    }
}

function addMarker(imageSrc, imageSize, imageOption, latitude, longitude, name, address, tel, closeday) {
    var markerImage = new daum.maps.MarkerImage(imageSrc, imageSize, imageOption),
    markerPosition = new daum.maps.LatLng(latitude, longitude);
    var marker = new daum.maps.Marker({
        position: markerPosition,
        image: markerImage,
        clickable: true,
        zIndex: 7
    });
    marker.setMap(map);
    
    daum.maps.event.addListener(map, 'dragstart', function() {
        marker.setMap(null);
    });
    
    var content = `
        <div class="card" style="width: 18rem;">
            <div class="card-body">
                <h5 class="card-title">${name}</h5>
                <p class="card-text"><strong>주소:</strong> ${address}</p>
                <p class="card-text"><strong>전화번호:</strong> ${tel}</p>
                <p class="card-text"><strong>휴관일:</strong> <span class="text-danger">${closeday}</span></p>
            </div>
        </div>
    `;

    var iwContent = content,
        iwPosition = markerPosition,
        iwRemoveable = true;

    var infowindow = new daum.maps.InfoWindow({
        position : iwPosition,
        content : iwContent,
        removable : iwRemoveable,
        zIndex : 10
    });

    daum.maps.event.addListener(marker, 'click', function() {
        infowindow.open(map, marker);
    });
}


function computeDistance (startCoords, destCoords) {
    var startLatRads = degreesToRadians(startCoords.latitude);
    var startLongRads = degreesToRadians(startCoords.longitude);
    var destLatRads = degreesToRadians(destCoords.latitude);
    var destLongRads = degreesToRadians(destCoords.longitude);
    var Radius = 6371;
    var distance = Math.acos(Math.sin(startLatRads) * Math.sin(destLatRads) +
                            Math.cos(startLatRads) * Math.cos(destLatRads) *
                            Math.cos(startLatRads - destLatRads)) * Radius;
    return distance;
}

function degreesToRadians(degrees) {
    var radians = (degrees * Math.PI)/180;
    return radians;
}

function find(){ // find 버튼을 눌렀을 때(onClick)
	mapContainer = document.getElementById('map'), // 지도를 표시할 div 설정
	mapOption = {
		center: new daum.maps.LatLng(37.56544,126.977119,17), // 지도 중심좌표 시청으로 임의 지정.
		level: 13 // 지도의 확대 레벨
		};
	
	var gu = document.getElementById("gu"); //html의 gu를 가져온다.
	gus = gu.options[gu.selectedIndex].value; //gus는 gu의 값을 가지고 있다.(ex: 강북구, 강동구..)
	
	switch(gu.selectedIndex){//선택된 인덱스 번호
	case 0: // 강남구
		mapOption = {
			center: new daum.maps.LatLng(37.4968488,127.0679394),//강남구 좌표 지정
			level: 7 // 지도의 확대 레벨
			};
		break;
	case 1: //강동구
		mapOption = {
			center: new daum.maps.LatLng(37.5492994,127.1464275),//강동구 좌표 지정
			level: 7 // 지도의 확대 레벨
			};
		break;
	case 2: //강북구 
		mapOption = {
			center: new daum.maps.LatLng(37.6482131,127.0164069),//강북구 좌표 지정
			level: 7 // 지도의 확대 레벨
			};
		break;
	case 3: //강서구 
		mapOption = {
			center: new daum.maps.LatLng(37.552593,126.85051),//강서구 좌표 지정
			level:7 // 지도의 확대 레벨
			};
		break;
	case 4: //관악구 
		mapOption = {
			center: new daum.maps.LatLng(37.4654529,126.9442478),//관악구 좌표 지정
			level: 7 // 지도의 확대 레벨
			};
		break;
	case 5: //광진구 
		mapOption = {
			center: new daum.maps.LatLng(37.5388,127.083445),//광진구 좌표 지정
			level: 7 // 지도의 확대 레벨
			};
		break;
	case 6: //구로구   
		mapOption = {
			center: new daum.maps.LatLng(37.495765,126.8578697),//구로구 좌표 지정
			level: 7 // 지도의 확대 레벨
			};
		break;
	case 7: //금천구  
		mapOption = {
			center: new daum.maps.LatLng(37.4599896,126.9012665),//금천구 좌표 지정
			level: 7 // 지도의 확대 레벨
			};
		break;
	case 8: //노원구  
		mapOption = {
			center: new daum.maps.LatLng(37.6541956,127.0769692),//노원구 좌표 지정
			level: 7 // 지도의 확대 레벨
			};
		break;
	case 9: //도봉구  
		mapOption = {
			center: new daum.maps.LatLng(37.6662325,127.0298724),//도봉구 좌표 지정
			level: 7 // 지도의 확대 레벨
			};
		break;
	case 10: //동대문구  
		mapOption = {
			center: new daum.maps.LatLng(37.5835755,127.0505528),//동대문구 좌표 지정
			level: 7 // 지도의 확대 레벨
			};
		break;
	case 11: //동작구  
		mapOption = {
			center: new daum.maps.LatLng(37.4971121,126.944378),//동작구 좌표 지정
			level: 7 // 지도의 확대 레벨
			};
		break;
	case 12: //마포구  
		mapOption = {
			center: new daum.maps.LatLng(37.5615964,126.9086431),//마포구 좌표 지정
			level: 7 // 지도의 확대 레벨
			};
		break;
	case 13: //서대문구  
		mapOption = {
			center: new daum.maps.LatLng(37.583312,126.9356601),//서대문구 좌표 지정
			level: 7 // 지도의 확대 레벨
			};
		break;
	case 14: //서초구  
		mapOption = {
			center: new daum.maps.LatLng(37.483574,127.032661),//서초구 좌표 지정
			level: 7 // 지도의 확대 레벨
			};
		break;
	case 15: //성동구  
		mapOption = {
			center: new daum.maps.LatLng(37.5508768,127.0408952),//성동구 좌표 지정
			level: 7 // 지도의 확대 레벨
			};
		break;
	case 16: //성북구  
		mapOption = {
			center: new daum.maps.LatLng(37.6023295,127.025236),//성북구 좌표 지정
			level: 7 // 지도의 확대 레벨
			};
		break;
	case 17: //송파구 
		mapOption = {
			center: new daum.maps.LatLng(37.504741,127.1144649),//송파구 좌표 지정
			level: 7 // 지도의 확대 레벨
			};
		break;
	case 18: //양천구 
		mapOption = {
			center: new daum.maps.LatLng(37.527432,126.8558783),//양천구 좌표 지정
			level: 7 // 지도의 확대 레벨
			};
		break;
	case 19: //영등포구 
		mapOption = {
			center: new daum.maps.LatLng(37.525423,126.896395),//영등포구 좌표 지정
			level: 7 // 지도의 확대 레벨
			};
		break;
	case 20: //용산구 
		mapOption = {
			center: new daum.maps.LatLng(37.5305208,126.9809672),//용산구 좌표 지정
			level: 7 // 지도의 확대 레벨
			};
		break;
	case 21: //은평구 
		mapOption = {
			center: new daum.maps.LatLng(37.6175107,126.9249166),//은평구 좌표 지정
			level: 7 // 지도의 확대 레벨
			};
		break;
	case 22: //종로구 
		mapOption = {
			center: new daum.maps.LatLng(37.6009106,126.9835817),//종로구 좌표 지정
			level: 7 // 지도의 확대 레벨
			};
		break;
	case 23: //중구 
		mapOption = {
			center: new daum.maps.LatLng(37.5576747,126.9941653),//중구 좌표 지정
			level: 7 // 지도의 확대 레벨
			};
		break;
	case 24: //중랑구 
		mapOption = {
			center: new daum.maps.LatLng(37.5950497,127.0957062),//중랑구 좌표 지정
			level: 7 // 지도의 확대 레벨
			};
		break;
		
	}//switch
	
	//지도를 표시할 div와 지도 옵션으로 지도 생성
	map = new daum.maps.Map(mapContainer, mapOption);

    // 지도 확대 축소를 제어할 수 있는 줌 컨트롤 생성
    var zoomControl = new daum.maps.ZoomControl();
    map.addControl(zoomControl, daum.maps.ControlPosition.RIGHT);
	
	daum.maps.event.addListener(map, 'dragend', function() {
		handleRefresh(); //지도의 중심이 이동될때도 마커 다시 표시
	});
	
	handleRefresh(); //검색버튼을 클릭할 때 마커 표시
} //find

function addBound(radius) {
    var bound = new daum.maps.Circle({
        center: map.getCenter(),
        radius: radius,
        strokeWeight: 5,
        strokeColor: '#F7D358',
        strokeOpacity: 0.5,
        strokeStyle: 'solid',
        fillColor: '#F7FE2E',
        fillOpacity: 0.3,
        zIndex: 1
});

bound.setMap(map);

daum.maps.event.addListener(map, 'dragstart', function () {
    bound.setMap(null);
});
}

function go_top(orix, oriy, desx, desy) {
	var Timer;
	if (document.body.scrollTop == 0) {
		var winHeight = document.documentElement.scrollTop;
	} else {
		var winHeight = document.body.scrollTop;
	}
	if (Timer) clearTimeout(Timer);
	startx = 0;
	starty = winHeight;
	if (!orix || orix < 0) orix = 0;
	if (!oriy || oriy < 0) oriy = 0;
	var speed = 7;
	if (!desx) desx = 0 + startx;
	if (!desy) desy = 0 + starty;
	desx += (orix - startx) / speed;
	if (desx < 0) desx = 0;
	desy += (oriy - starty) / speed;
	if (desy < 0) desy = 0;
	var posX = Math.ceil(desx); var posY = Math.ceil(desy);
	window.scrollTo(posX, posY);
	if ((Math.floor(Math.abs(startx - orix)) < 1) && (Math.floor(Math.abs(starty - oriy)) < 1)) {
		clearTimeout(Timer);
		window.scroll(orix, oriy);
	} else if (posX != orix || posY != oriy) {
		Timer = setTimeout("go_top("+orix+","+oriy+","+desx+","+desy+")",15);
	} else {
		clearTimeout(Timer);
	}
}