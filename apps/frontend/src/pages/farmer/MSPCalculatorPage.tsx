import React from 'react';
import { MSPCalculator } from '../../components/domain/MSPCalculator';

export const MSPCalculatorPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 lg:px-8 py-8 max-w-4xl space-y-6">
      <div>
        <div className="section-label">Price Assurance</div>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold">
          Government MSP & Savings Calculator
        </h1>
        <p className="text-xs text-text-muted mt-1">
          Calculate the exact difference between local arthiya/middleman trader offers and official Cabinet-approved MSP rates.
        </p>
      </div>

      <MSPCalculator />
    </div>
  );
};

export default MSPCalculatorPage;
