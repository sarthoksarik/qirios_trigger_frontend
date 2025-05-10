import React, { useEffect } from 'react';
import { useAppContext } from '../hooks/useAppContext';

const DemandTitleList = () => {
  const { selectedCustomer, selectedTitle, selectTitle } = useAppContext();

  // Automatically select the first title when available and none is selected
  useEffect(() => {
    if (
      selectedCustomer?.demand_titles?.length > 0 &&
      !selectedTitle
    ) {
      selectTitle(selectedCustomer.demand_titles[0]);
    }
  }, [selectedCustomer, selectedTitle, selectTitle]);

  if (!selectedCustomer?.demand_titles || selectedCustomer.demand_titles.length === 0) {
    return null;
  }

  return (
    <div className="pb-2 border-bottom">
      <div className="d-flex flex-wrap gap-2">
        {selectedCustomer.demand_titles.map((title) => (
          <button
            key={title.title}
            type="button"
            className={`btn btn-sm ${
              selectedTitle?.title === title.title ? 'btn-success' : 'btn-outline-secondary'
            }`}
            onClick={() => selectTitle(title)}
          >
            {title.title}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DemandTitleList;
