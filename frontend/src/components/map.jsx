import { useEffect, useState, useRef } from "react";
import axios from 'axios';
import StoreInfo from './info';
import Input from './input';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_KEY;

export default function Map() {
  const [longitude, setLongitude] = useState(null);
  const [latitude, setLatitude] = useState(null);
  const [selectedStore, setSelectedStore] = useState(null);
  const [storeData, setStoreData] = useState([]);
  const [scoresMap, setScoresMap] = useState({});
  const mapRef = useRef(null);

  // Function to fetch all scores at load time
  const fetchAllScores = async (listingIds) => {
    try {
      const response = await axios.post('https://quickspace.austin.kim/scores', {
        listingIds: listingIds
      }, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });
      console.log('📊 All Scores API response:', response.data);
      
      // Convert array to map for easy lookup by listingId
      const scoresLookup = {};
      if (response.data && response.data.data) {
        response.data.data.forEach(item => {
          scoresLookup[item.listingId] = item.scores;
        });
      }
      
      return scoresLookup;
    } catch (error) {
      console.error('❌ Scores API error:', error);
      return {};
    }
  };

  // Function to remove stores by IDs
  const removeStoresById = (idsToRemove) => {
    console.log("🔴 IDs to remove:", idsToRemove);
    console.log("📊 Current storeData:", storeData);
    console.log("🔍 Store IDs in current data:", storeData.map(store => store.listingId));
    
    // Convert IDs to strings for comparison since store.listingId are strings
    const idsToRemoveAsStrings = idsToRemove.map(id => String(id));
    console.log("🔄 IDs converted to strings:", idsToRemoveAsStrings);
    
    setStoreData(prevData => {
      console.log("⚡ PrevData in setState:", prevData);
      const filteredData = prevData.filter(store => !idsToRemoveAsStrings.includes(store.listingId));
      console.log("✅ Filtered data (remaining stores):", filteredData);
      console.log("📈 Before filtering:", prevData.length, "After filtering:", filteredData.length);
      return filteredData;
    });
  };

  // Function to render markers from data
  const renderMarkersFromData = (data) => {
    if (!mapRef.current || !window.mapboxgl) return;
    
    const mapboxgl = window.mapboxgl;
    data.forEach(obj => {
      // obj here comes from info.data.data (store details)
      // We need to find the corresponding coordinates from the original ids.data.data
      const coords = obj.coords || obj.coordinations;
      if (coords && coords.length > 0 && coords[0]) {
        const [lng, lat] = coords[0];
        const ll = new mapboxgl.LngLat(lng, lat);
        const marker = new mapboxgl.Marker({ color: "blue" })
          .setLngLat(ll)
          .addTo(mapRef.current);
        
        // Add click handler
        marker.getElement().addEventListener('click', (e) => {
          e.stopPropagation();
          mapRef.current.setCenter(ll);
          // Pass the complete store object with all its properties
          setSelectedStore(obj);
        });
      }
    });
  };

  const Api = "'https://quickspace.austin.kim/NPC'";

  // Watch storeData and re-render markers when it changes
  useEffect(() => {
    if (mapRef.current && window.mapboxgl && storeData.length > 0) {
      // Clear existing blue markers
      const allMarkers = document.querySelectorAll('.mapboxgl-marker');
      allMarkers.forEach(marker => {
        // Only remove blue markers (keep red user location marker)
        if (marker.querySelector('[fill="#3FB1CE"]') || marker.style.backgroundColor === 'blue') {
          marker.remove();
        }
      });
      
      // Re-add markers for current storeData
      renderMarkersFromData(storeData);
    }
  }, [storeData]);

  // 1️⃣ Get user's geolocation
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLongitude(position.coords.longitude);
        setLatitude(position.coords.latitude);
      },
      (error) => console.error("Geolocation error:", error),
      { enableHighAccuracy: true }
    );
  }, []);

  // 2️⃣ Initialize Mapbox + marker
  useEffect(() => {
    if (longitude && latitude && window.mapboxgl) {
      const mapboxgl = window.mapboxgl;
      mapboxgl.accessToken = MAPBOX_TOKEN;

      const map = new mapboxgl.Map({
        container: "map",
        style: "mapbox://styles/mapbox/streets-v12",
        center: [longitude, latitude],
        zoom: 15,
      });

      // 🔴 Create a red marker at the current location
      new mapboxgl.Marker({ color: "red" })
        .setLngLat([longitude, latitude])
        .addTo(map);

      mapRef.current = map;

      // 🧹 Cleanup on unmount
      return () => map.remove();
    }
  }, [longitude, latitude]);

  useEffect(() => {
    if (longitude && latitude) {
      const fetchData = async () => {
        try {
          //lat + long -> postal
          const response = await axios.get('https://quickspace.austin.kim/NPC', {
            params: {
              lat: latitude,
              lng: longitude,
            },
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
          });
          console.log('NPC API response:', response.data);
          // Example for chaining another request:
          // postal -> listIds +coordinates
          const ids = await axios.get('https://quickspace.austin.kim/points', {
            params: { zipcode: response.data.data[0]},
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
          });
          console.log('Points API response:', ids.data.data);
          let arr_ids = (ids.data.data).map(item => item.listingId).slice(0, 20)

          //listIds+Coordinates -> subset of detailed information
          const info = await axios.get('https://quickspace.austin.kim/detailedInfo', {
            params: {
                listingIds: `[${arr_ids}]`,
              },
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
              },
          });

          // Merge coordinate data with store details
          const mergedStoreData = info.data.data.slice(0, 20).map(storeDetail => {
            // Find corresponding coordinate data
            const coordData = ids.data.data.find(coord => coord.listingId === storeDetail.listingId);
            return {
              ...storeDetail,
              coordinations: coordData?.coordinations || []
            };
          });

          // Save the merged store data for Input
          setStoreData(mergedStoreData);
          console.log(info.data.data);
          
          // Fetch all scores for the listing IDs
          console.log('🎯 Fetching scores for all listings:', arr_ids);
          const allScores = await fetchAllScores(arr_ids);
          setScoresMap(allScores);
          console.log('📊 Scores map created:', allScores);
        } catch (error) {
          console.error('API error:', error);
        }
      };
      fetchData();
    }
  }, [longitude, latitude]);

  return (
    <>
      <div id="map" style={{ width: "100%", height: "100vh" }} />
      {selectedStore && (
        <StoreInfo 
          loopNetProp={selectedStore} 
          aiSummary={selectedStore.aiSummary}
          scoresData={scoresMap[selectedStore.listingId] || null}
        />
      )}
  <Input onResponse={removeStoresById} storeData={storeData} />
    </>
  );
}
