import React, { useState } from 'react';

interface ReadMoreProps {
  text: string;
  maxLength: number;
}

const ReadMore: React.FC<ReadMoreProps> = ({ text, maxLength }) => {
  const [isReadMore, setIsReadMore] = useState(true);

  const toggleReadMore = () => {
    setIsReadMore(!isReadMore);
  };

  return (
    <p>
      {isReadMore ? text.slice(0, maxLength) : text}
      {text.length > maxLength && (
        <span onClick={toggleReadMore} style={{ color: 'blue', cursor: 'pointer' }}>
          {isReadMore ? '...read more' : ' show less'}
        </span>
      )}
    </p>
  );
};

export default ReadMore;