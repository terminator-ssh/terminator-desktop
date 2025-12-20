import React from 'react';

const Hosts: React.FC = () => {
    return (
        <div className="hosts">
            <h2>Save hosts</h2>
            <input type="text" placeholder="Поиск..." className="search-input" />
            <div className="host-list">
                {/* Здесь можно будет использовать маппинг по массиву хостов */}
                <div className="host-item">wing.auto.loader.tech</div>
                <div className="host-item">wing.auto.loader.tech</div>
                {/* Добавьте больше хостов */}
            </div>
        </div>
    );
};

export default Hosts;