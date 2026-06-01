import React, { useState } from 'react';

export default function StarRating({ rating = 0, maxStars = 5, interactive = false, onRate, totalReviews }) {
  const [hovered, setHovered] = useState(0);

  const display = hovered || rating;

  return (
    <span>
      {Array.from({ length: maxStars }, (_, i) => i + 1).map((star) => (
        <span
          key={star}
          className={`${display >= star ? 'star-filled' : 'star-empty'} ${interactive ? 'star-interactive' : ''}`}
          onClick={() => interactive && onRate && onRate(star)}
          onMouseEnter={() => interactive && setHovered(star)}
          onMouseLeave={() => interactive && setHovered(0)}
        >
          {display >= star ? '★' : '☆'}
        </span>
      ))}
      {!interactive && (
        <small className="text-muted ms-1">
          {Number(rating).toFixed(1)} / 5
          {totalReviews !== undefined && ` (${totalReviews} review${totalReviews !== 1 ? 's' : ''})`}
        </small>
      )}
    </span>
  );
}
