import React from 'react'

const shimmerStyle: React.CSSProperties = {
    display: 'inline-block',
    width: '48px', 
    height: '48px', 
    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
    backgroundSize: '200px 100%',
    borderRadius: '50%',
    animation: 'shimmer 1.5s infinite',
  };

const ProfileImageShimmer = () => {
  return (
    <div style={shimmerStyle} />
  )
}

export default ProfileImageShimmer