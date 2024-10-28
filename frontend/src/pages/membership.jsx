import React from 'react';
import './membership.css';
import image1 from '../images/1.jpg';
import image2 from '../images/2.jpg';
import image3 from '../images/3.jpg';

const Membership = () => {
  const memberships = [
    {
      tier: 'Basic',
      description: 'Free membership available to everyone',
      benefits: ['No benefits'],
      image: image1,
    },
    {
      tier: 'VIP',
      description: '\$20/month',
      benefits: ['Free Parking'],
      image: image2, 
    },
    {
      tier: 'Premium',
      description: '\$70/month',
      benefits: ['Entry to exclusive exhibits'],
      image: image3
    },
  ];

  return (
    <div className="memberships-container">
      <h1>Membership Options</h1>
      <div className="memberships-list">
        {memberships.map((membership, index) => (
          <div className="membership-card" key={index}>
            <img src={membership.image} alt={`${membership.tier} Membership`} className="membership-image" />
            <h4>{membership.tier}</h4>
            <p>{membership.description}</p>
            <ul>
              {membership.benefits.map((benefit, index) => (
                <li key={index}>{benefit}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Membership;
