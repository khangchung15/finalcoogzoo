import React from 'react';
import './membership.css';
import image1 from '../images/1.jpg';
import image2 from '../images/2.jpg';
import image3 from '../images/3.jpg';

const Membership = () => {
  const memberships = [
    {
      tier: 'Beta Maggot',
      description: 'Most boring & basic membership tier',
      benefits: ['Ticket Discount', 'Monthly newsletters', 'Discounts on gift shop', 'Brain will slowly turn into a bicycle'],
      image: image1,
    },
    {
      tier: 'Alpha John',
      description: 'All Maggot benefits. Mid at best',
      benefits: ['All Maggot benefits', 'Daily newsletters', 'Free parking','Employee will call you 24/7'],
      image: image2, 
    },
    {
      tier: 'Sigma Werewolf',
      description: 'Best membership tier with all the benefits you could think of',
      benefits: ['All Alpha John benefits', 'Discount on food and drink', 'Priority entry','Employee will rip their shirt & start howling occasionally'],
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
