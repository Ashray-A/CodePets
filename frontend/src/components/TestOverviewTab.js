import React from 'react';
import './OverviewTab.css';

const TestOverviewTab = ({ pet, onActivityLogged }) => {
  return (
    <div className="test-overview">
      <h1>Test Overview Tab</h1>
      <p>Pet name: {pet?.name || 'Unknown'}</p>
      <p>Pet stage: {pet?.stage || 'Unknown'}</p>
      <p>Pet experience: {pet?.experience || 0}</p>
    </div>
  );
};

export default TestOverviewTab;
