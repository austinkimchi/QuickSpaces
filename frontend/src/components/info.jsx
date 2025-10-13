import React from 'react';

export default function StoreInfo({ loopNetProp, aiSummary, scoresData }) {
  if (!loopNetProp) return null;

  return (
  <div className="border rounded-lg p-4 max-w-sm h-96 shadow absolute left-4 top-1/2 -translate-y-1/2 overflow-y-auto bg-white scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent z-50">
      {/* Image Card */}
      <div className="w-full h-32 bg-gray-200 rounded-lg mb-3 flex items-center justify-center">
        <img 
          src={loopNetProp.photo || "https://images1.loopnet.com/i2/4azmK4_HGoBaF7o2c5k0uOhP-jBJRNNXGvNUMWD8A7Y/116/image.jpg"} 
          alt={loopNetProp.location?.name || "Property"} 
          className="max-w-full max-h-full rounded-lg object-cover"
          onError={(e) => {
            console.log("Image failed to load:", loopNetProp.photo);
            e.target.src = "https://images1.loopnet.com/i2/4azmK4_HGoBaF7o2c5k0uOhP-jBJRNNXGvNUMWD8A7Y/116/image.jpg";
          }}
        />
      </div>
      
      {/* Title & Subtitle */}
      <h2 className="mb-1 text-lg font-semibold">
        {loopNetProp.title?.[0] || loopNetProp.location?.name || 'Property Name'}
      </h2>
      <h4 className="mb-1 text-gray-600 text-base">
        {loopNetProp.title?.[1] || loopNetProp.location?.cityState || 'Location'}
      </h4>
      
      {/* Price Information */}
      {loopNetProp.fullPrice && (
        <div className="mb-2">
          <span className="text-green-600 font-semibold text-lg">{loopNetProp.fullPrice}</span>
          <span className="text-sm text-gray-500 ml-2">per sq ft</span>
        </div>
      )}
      
      {/* Address & Available Space */}
      <div className="mb-2">
        {loopNetProp.location?.availableSpace && (
          <div className="text-sm text-blue-600 mt-1">
            {loopNetProp.location.availableSpace}
          </div>
        )}
        <div className="text-xs text-gray-500">
          {loopNetProp.location?.cityState} {loopNetProp.location?.postalCode}
        </div>
        <br />
        <a 
          href={`http://loopnet.com/list/${loopNetProp.listingId}`}
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-blue-600 underline text-sm"
        >
          View on LoopNet
        </a>
      </div>
      
      {/* Property Summary */}
      {loopNetProp.shortSummary && (
        <p className="mb-3 text-gray-700 text-sm">
          {loopNetProp.shortSummary}
        </p>
      )}
      
      {/* Notes */}
      {loopNetProp.notes && loopNetProp.notes.length > 0 && (
        <div className="mb-3">
          <h5 className="font-medium text-sm text-gray-800 mb-1">Property Details:</h5>
          {loopNetProp.notes.map((note, index) => (
            <p key={index} className="text-gray-600 text-xs mb-1">
              {note}
            </p>
          ))}
        </div>
      )}
      
      {/* AI Summary */}
      {aiSummary && (
        <div className="mb-3">
          <h5 className="font-medium text-sm text-gray-800 mb-1">AI Analysis:</h5>
          <p className="text-gray-600 text-xs">
            {aiSummary}
          </p>
        </div>
      )}
      
      {/* Scores Grid */}
      {scoresData ? (
        <div className="mb-3">
          <h5 className="font-medium text-sm text-gray-800 mb-2">Property Scores:</h5>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(scoresData).map(([key, value], index) => {
              // Color code based on score value
              const getScoreColor = (score) => {
                if (score >= 7) return "bg-green-100 text-green-800";
                if (score >= 5) return "bg-yellow-100 text-yellow-800";
                if (score >= 0) return "bg-red-100 text-red-800";
                return "bg-gray-100 text-gray-800";
              };
              
              return (
                <div key={index} className={`p-2 rounded text-center ${getScoreColor(value)}`}>
                  <div className="font-bold text-base">
                    {value === -1 ? 'N/A' : value}
                  </div>
                  <div className="text-xs font-medium capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="mb-3">
          <h5 className="font-medium text-sm text-gray-800 mb-2">Property Scores:</h5>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gray-100 p-2 rounded text-center animate-pulse">
              <div className="font-bold text-base">...</div>
              <div className="text-xs text-gray-500">Loading</div>
            </div>
            <div className="bg-gray-100 p-2 rounded text-center animate-pulse">
              <div className="font-bold text-base">...</div>
              <div className="text-xs text-gray-500">Loading</div>
            </div>
            <div className="bg-gray-100 p-2 rounded text-center animate-pulse">
              <div className="font-bold text-base">...</div>
              <div className="text-xs text-gray-500">Loading</div>
            </div>
            <div className="bg-gray-100 p-2 rounded text-center animate-pulse">
              <div className="font-bold text-base">...</div>
              <div className="text-xs text-gray-500">Loading</div>
            </div>
          </div>
        </div>
      )}

      {/* Property Facts Grid */}
      {loopNetProp.shortPropertyFacts && loopNetProp.shortPropertyFacts.length > 0 && (
        <div className="grid grid-cols-2 gap-2 mb-3">
          {loopNetProp.shortPropertyFacts.flat().slice(0, 4).map((fact, index) => (
            <div key={index} className="bg-blue-50 p-2 rounded text-center">
              <div className="font-bold text-sm">{fact}</div>
              <div className="text-xs text-blue-600">Property Info</div>
            </div>
          ))}
        </div>
      )}
      
      {/* Listing Type Badge */}
      {loopNetProp.listingType && (
        <div className="mt-3">
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
            {loopNetProp.listingType.replace(/([A-Z])/g, ' $1').trim()}
          </span>
        </div>
      )}
    </div>
  );
}