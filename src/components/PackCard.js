import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const PackCard = ({ pack, onSelect, isSelected }) => {
  const { t } = useLanguage();
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  const handleQuantityChange = (e) => {
    setSelectedQuantity(parseInt(e.target.value));
  };

  const handleSelect = () => {
    onSelect(pack, selectedQuantity);
  };

  return (
    <div className={`card h-100 ${isSelected ? 'border-primary' : ''}`}>
      <div className="card-body">
        <h5 className="card-title">{pack.name}</h5>
        <p className="card-text">
          <strong>{t('totalPrice')}:</strong> {pack.totalPrice.toLocaleString()} {t('DA')}
        </p>
        <p className="card-text">
          <strong>{t('articles')}:</strong> {pack.articles}
        </p>
        {pack.gift && (
          <p className="card-text text-success">
            <strong>{t('gift')}:</strong> {pack.gift}
          </p>
        )}
        <p className="card-text">
          <strong>{t('available')}:</strong> 
          <span className={pack.quantity > 0 ? 'text-success' : 'text-danger'}>
            {pack.quantity} {t('packs')}
          </span>
        </p>
        
        {pack.quantity > 0 && (
          <div className="mb-3">
            <label className="form-label">{t('quantity')}:</label>
            <select 
              className="form-select" 
              value={selectedQuantity}
              onChange={handleQuantityChange}
              max={pack.quantity}
            >
              {[...Array(Math.min(pack.quantity, 10))].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
          </div>
        )}
        
        <button 
          className={`btn ${isSelected ? 'btn-success' : 'btn-primary'} w-100`}
          onClick={handleSelect}
          disabled={pack.quantity === 0}
        >
          {isSelected ? t('selected') : t('selectPack')}
          {isSelected && ` (${selectedQuantity})`}
        </button>
      </div>
    </div>
  );
};

export default PackCard;
