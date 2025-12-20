import React from 'react';

const Keychains: React.FC = () => {
    return (
        <div className="keychains">
            <h2>Save keys</h2>
            <input type="text" placeholder="Поиск..." className="search-input" />
            <div className="keychain-list">
                {/* Здесь можно будет использовать маппинг по массиву ключей */}
                <div className="keychain-item">Key 1</div>
                <div className="keychain-item">Key 2</div>
                {/* Добавьте больше ключей */}
            </div>
        </div>
    );
};

export default Keychains;