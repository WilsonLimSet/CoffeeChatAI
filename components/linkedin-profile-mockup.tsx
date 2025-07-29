import React from 'react';
import Image from 'next/image';

const LinkedInProfileMockup = () => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 max-w-md mx-auto">
      <div className="relative h-24 bg-gradient-to-r from-blue-500 to-blue-600">
        <div className="absolute -bottom-12 left-6">
          <div className="w-24 h-24 rounded-full bg-gray-300 dark:bg-gray-600 border-4 border-white dark:border-gray-900 overflow-hidden">
            <Image 
              src="/images/davidsol.jpeg" 
              alt="David Solomon"
              width={96}
              height={96}
              className="object-cover"
            />
          </div>
        </div>
      </div>
      
      <div className="pt-16 px-6 pb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">David Solomon</h2>
        <p className="text-gray-600 dark:text-gray-300 mt-1">
          Chairman & CEO at Goldman Sachs
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          New York, United States
        </p>
        
        <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">
          <p className="mb-2">
            <span className="font-semibold">Experience:</span> 25+ years at Goldman Sachs
          </p>
          <p className="mb-2">
            <span className="font-semibold">Education:</span> Hamilton College, Political Science
          </p>
          <p>
            <span className="font-semibold">Also:</span> DJ at Payback Records 🎵
          </p>
        </div>
        
        <div className="mt-4 flex items-center text-sm text-blue-600 dark:text-blue-400">
          <span className="font-semibold">500+</span>
          <span className="ml-1 text-gray-500 dark:text-gray-400">connections</span>
        </div>
      </div>
    </div>
  );
};

export default LinkedInProfileMockup;