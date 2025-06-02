import React, { useEffect, useState, useRef } from 'react';

function PharmacyMapPage() {
  const [pharmacies, setPharmacies] = useState([]);
  const mapRef = useRef(null);
  const markersRef = useRef({});
  const infoWindowRef = useRef(new window.kakao.maps.InfoWindow({ zIndex: 1 }));

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          try {
            const container = document.getElementById('map');
            const options = {
              center: new window.kakao.maps.LatLng(latitude, longitude),
              level: 5 //확대 범위 - 상세 지도
            };
            const map = new window.kakao.maps.Map(container, options);
            mapRef.current = map;

            const userPosition = new window.kakao.maps.LatLng(latitude, longitude);
            const userOverlay = new window.kakao.maps.CustomOverlay({
              content: '<div style="width: 12px; height: 12px; background-color: #00aa9d; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.3);"></div>',
              position: userPosition,
              yAnchor: 0.5
            });
            userOverlay.setMap(map);

            const placesService = new window.kakao.maps.services.Places();
            placesService.categorySearch('PM9', (result, status) => {
              if (status === window.kakao.maps.services.Status.OK) {
                Object.values(markersRef.current).forEach(marker => marker.setMap(null));
                markersRef.current = {};
                setPharmacies(result);

                result.forEach((place) => {
                  const position = new window.kakao.maps.LatLng(place.y, place.x);
                  const marker = new window.kakao.maps.Marker({
                    position: position,
                    map: map
                  });
                  markersRef.current[place.id] = marker;

                  window.kakao.maps.event.addListener(marker, 'click', function() {
                    infoWindowRef.current.setContent(`<div style="padding:5px;font-size:12px;">${place.place_name}</div>`);
                    infoWindowRef.current.open(map, marker);
                  });
                });
              }
            }, {
              location: new window.kakao.maps.LatLng(latitude, longitude),
              radius: 1000
            });
          } catch (error) {
            console.error('카카오 지도 초기화 오류:', error);
            alert('지도를 불러오는 중 오류가 발생했습니다');
          }
        },
        (error) => {
          console.error('위치 정보를 가져오는데 실패했습니다:', error);
          alert('위치 정보를 가져오는데 실패했습니다\n 위치 권한을 허용해주세요');
        }
      );
    } else {
      alert('이 브라우저에서는 위치 정보를 지원하지 않습니다');
    }

    const currentInfoWindow = infoWindowRef.current;
    return () => {
      Object.values(markersRef.current).forEach(marker => marker.setMap(null));
      currentInfoWindow.close();
    };
  }, []);

  const handleMouseEnter = (pharmacyId) => {
    const marker = markersRef.current[pharmacyId];
    if (marker && mapRef.current) {
      infoWindowRef.current.setContent(`<div style="padding:5px;font-size:12px;">${pharmacies.find(p => p.id === pharmacyId)?.place_name}</div>`);
      infoWindowRef.current.open(mapRef.current, marker);
    }
  };

  const handleMouseLeave = () => {
    infoWindowRef.current.close();
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>내 주변 약국</h2>
      </div>
      <div id="map" style={styles.map}></div>
      <div style={styles.pharmacyList}>
        <h3>주변 약국 목록</h3>
        {pharmacies.length > 0 ? (
          <ul style={styles.list}>
            {pharmacies.map((pharmacy) => (
              <li
                key={pharmacy.id}
                style={styles.listItem}
                onMouseEnter={() => handleMouseEnter(pharmacy.id)}
                onMouseLeave={handleMouseLeave}
              >
                <div style={styles.pharmacyName}>{pharmacy.place_name}</div>
                <div style={styles.pharmacyAddress}>{pharmacy.address_name}</div>
                <div style={styles.pharmacyPhone}>
                  {pharmacy.phone ? `전화: ${pharmacy.phone}` : '전화번호 없음'}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>주변 약국 정보를 불러오는 중</p>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    width: '100%',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderBottom: '1px solid #e9ecef',
  },
  title: {
    margin: 0,
    fontSize: '1.5rem',
  },
  map: {
    width: '100%',
    height: '50vh',
  },
  pharmacyList: {
    flex: 1,
    padding: '20px',
    overflowY: 'auto',
  },
  list: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  listItem: {
    padding: '15px',
    borderBottom: '1px solid #6c757d',
    cursor: 'pointer',
  },
  pharmacyName: {
    fontWeight: 'bold',
    fontSize: '1.1rem',
    marginBottom: '5px',
  },
  pharmacyAddress: {
    color: '#6c757d',
    fontSize: '0.9rem',
    marginBottom: '5px',
  },
  pharmacyPhone: {
    color: '#6c757d',
    fontSize: '0.9rem',
  },
};

export default PharmacyMapPage;