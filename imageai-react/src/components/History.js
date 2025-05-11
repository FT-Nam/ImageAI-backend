import React, { useEffect, useState } from 'react';
import { format, isToday, isYesterday, differenceInDays } from 'date-fns';
import { vi } from 'date-fns/locale';
import '../styles/history.scss';
import { useAuth } from '../contexts/AuthContext';

const History = ({ history = [], onSelectHistory, onDeleteHistory }) => {
  const historyArray = Array.isArray(history) ? history : [];

  const groupHistoryByDate = (items) => {
    return items.reduce((groups, item) => {
      const date = new Date(item.created_at);
      const today = new Date();
      const diffDays = differenceInDays(today, date);
      let groupKey;

      if (isToday(date)) {
        groupKey = 'Hôm nay';
      } else if (isYesterday(date)) {
        groupKey = 'Hôm qua';
      } else if (diffDays <= 3) {
        groupKey = '3 ngày trước';
      } else if (diffDays <= 7) {
        groupKey = '7 ngày trước';
      } else if (diffDays <= 30) {
        groupKey = '30 ngày trước';
      } else {
        groupKey = format(date, 'MMMM yyyy', { locale: vi });
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(item);
      return groups;
    }, {});
  };

  const handleItemClick = (item) => {
    onSelectHistory(item);
  };

  const handleDeleteClick = (e, itemId) => {
    e.stopPropagation();
    onDeleteHistory(itemId);
  };

  const getImageUrl = (url) => {
    const token = localStorage.getItem('token');
    if (!token) return url;
    
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}token=${token}`;
  };

  const groupedHistory = groupHistoryByDate(historyArray);

  return (
    <div className="history-container">
      {historyArray.length === 0 ? (
        <p className="no-history">Chưa có lịch sử phân tích</p>
      ) : (
        <div className="history-list">
          {Object.entries(groupedHistory).map(([date, items]) => (
            <div key={date} className="history-group">
              <div className="group-header">{date}</div>
              {items.map((item) => (
                <div key={item.id} className="history-item">
                  <div 
                    className="history-content"
                    onClick={() => handleItemClick(item)}
                  >
                    <div className="history-image">
                      <img src={getImageUrl(item.image_url)} alt={item.result} />
                      <div className="image-overlay">
                        <span className="confidence">{item.confident}%</span>
                      </div>
                    </div>
                    <div className="history-info">
                      <div className="history-header">
                        <h4>{item.result}</h4>
                        <span className="timestamp">
                          {format(new Date(item.created_at), 'HH:mm', { locale: vi })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button 
                    className="delete-btn"
                    onClick={(e) => handleDeleteClick(e, item.id)}
                  >
                    <img src="/icons/delete.svg" alt="Delete" />
                  </button>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History; 