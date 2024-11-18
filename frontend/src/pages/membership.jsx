import React, { useState, useEffect } from 'react';
import './membership.css';
import image1 from '../images/1.jpg';
import image2 from '../images/2.jpg';
import image3 from '../images/3.jpg';
import { useAuth } from '../components/AuthContext';

const Membership = () => {
  const { userRole, userEmail } = useAuth();
  const isCustomer = userRole === 'Customer';

  const [selectedDuration, setSelectedDuration] = useState('monthly');
  const [currentUserMembership, setCurrentUserMembership] = useState('basic');
  const [loading, setLoading] = useState(false);
  const [showExpirationWarning, setShowExpirationWarning] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedMembership, setSelectedMembership] = useState(null);
  const [membershipDetails, setMembershipDetails] = useState({
    expiryDate: null,
    daysUntilExpiry: null,
    memberType: 'basic'
  });

  const membershipLevels = {
    'basic': 1,
    'vip': 2,
    'premium': 3
  };

  useEffect(() => {
    if (isCustomer && userEmail) {
      const fetchMembershipDetails = async () => {
        try {
          const customerResponse = await fetch(`http://localhost:5000/profile?email=${userEmail}&type=customer`);
          if (!customerResponse.ok) throw new Error('Failed to fetch user profile');
          const customerData = await customerResponse.json();
          const userId = customerData.profile.ID;

          const response = await fetch(`http://localhost:5000/membership-details?userId=${userId}`);
          if (!response.ok) throw new Error('Failed to fetch membership details');
          
          const data = await response.json();
          setMembershipDetails(data);
          setCurrentUserMembership(data.memberType);
          
          if (data.expiryDate) {
            const expiryDate = new Date(data.expiryDate);
            const today = new Date();
            const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
            
            if (daysUntilExpiry <= 7 && daysUntilExpiry > 0) {
              setShowExpirationWarning(true);
            }
          }
        } catch (error) {
          console.error('Error fetching membership details:', error);
        }
      };

      fetchMembershipDetails();
    }
  }, [isCustomer, userEmail]);

  const handleMembershipChange = (membership) => {
    setSelectedMembership(membership);
    setShowConfirmModal(true);
  };

  const handleUpgrade = async (tier) => {
    setLoading(true);
    try {
      const customerResponse = await fetch(`http://localhost:5000/profile?email=${userEmail}&type=customer`);
      if (!customerResponse.ok) throw new Error('Failed to fetch user profile');
      const customerData = await customerResponse.json();
      const userId = customerData.profile.ID;

      const response = await fetch('http://localhost:5000/upgrade-membership', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          membershipTier: tier,
          durationType: selectedDuration,
        }),
      });

      if (!response.ok) {
        throw new Error('Upgrade failed');
      }

      const updatedResponse = await fetch(`http://localhost:5000/membership-details?userId=${userId}`);
      if (updatedResponse.ok) {
        const updatedData = await updatedResponse.json();
        setMembershipDetails(updatedData);
        setCurrentUserMembership(updatedData.memberType);
      }

      setShowExpirationWarning(false);
    } catch (error) {
      console.error('Error upgrading membership:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    await handleUpgrade(selectedMembership.tier.toLowerCase());
    setShowConfirmModal(false);
    setSelectedMembership(null);
  };

  const getButtonText = (currentPlan, targetPlan) => {
    if (currentPlan === targetPlan.toLowerCase()) return 'Current Plan';
    
    const currentLevel = membershipLevels[currentPlan];
    const targetLevel = membershipLevels[targetPlan.toLowerCase()];

    return currentLevel > targetLevel ? 
      `Downgrade to ${targetPlan}` : 
      `Upgrade to ${targetPlan}`;
  };

  const memberships = [
    {
      tier: 'Basic',
      monthlyPrice: 0,
      annualPrice: 0,
      description: 'Free membership available to everyone',
      benefits: ['Basic access'],
      image: image1
    },
    {
      tier: 'VIP',
      monthlyPrice: 20,
      annualPrice: 200,
      description: 'Enhanced benefits for regular visitors',
      benefits: ['Basic access', 'Free Parking', '10% In-Store Discounts'],
      image: image2
    },
    {
      tier: 'Premium',
      monthlyPrice: 70,
      annualPrice: 700,
      description: 'Ultimate experience for enthusiasts',
      benefits: [
        'All VIP benefits',
        'Entry to exclusive exhibits',
        '20% In-Store Discount',
        'Guest Passes'
      ],
      image: image3
    }
  ];

  const getPrice = (membership) => {
    return selectedDuration === 'monthly' 
      ? `$${membership.monthlyPrice}/month`
      : `$${membership.annualPrice}/year`;
  };

  return (
    <div className="memberships-container">
      <h1>Membership Options</h1>

      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="confirmation-modal">
            <h3>Confirm Membership Change</h3>
            <p>
              {currentUserMembership === selectedMembership.tier.toLowerCase() 
                ? "You're already on this plan."
                : `Are you sure you want to ${membershipLevels[currentUserMembership] > membershipLevels[selectedMembership.tier.toLowerCase()] ? 'downgrade' : 'upgrade'} 
                   from ${currentUserMembership.toUpperCase()} to ${selectedMembership.tier}?`
              }
            </p>
            {selectedDuration === 'monthly' ? (
              <p>Monthly price: ${selectedMembership.monthlyPrice}/month</p>
            ) : (
              <p>Annual price: ${selectedMembership.annualPrice}/year</p>
            )}
            <div className="modal-buttons">
              <button 
                className="confirm-button"
                onClick={handleConfirm}
                disabled={currentUserMembership === selectedMembership.tier.toLowerCase()}
              >
                Confirm
              </button>
              <button 
                className="cancel-button"
                onClick={() => {
                  setShowConfirmModal(false);
                  setSelectedMembership(null);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {isCustomer ? (
        <>
          {showExpirationWarning && (
            <div className="expiration-warning">
              <div className="warning-content">
                <h3>Membership Expiring Soon!</h3>
                <p>Your {membershipDetails.memberType} membership will expire in {membershipDetails.daysUntilExpiry} days.</p>
                <p>Renew now to maintain your benefits and avoid service interruption.</p>
                <div className="warning-buttons">
                  <button 
                    className="renew-button"
                    onClick={() => handleUpgrade(membershipDetails.memberType)}
                  >
                    Renew Membership
                  </button>
                  <button 
                    className="close-button"
                    onClick={() => setShowExpirationWarning(false)}
                  >
                    Remind Me Later
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="duration-toggle">
            <label className="duration-label">
              <input
                type="radio"
                value="monthly"
                checked={selectedDuration === 'monthly'}
                onChange={(e) => setSelectedDuration(e.target.value)}
              />
              Monthly
            </label>
            <label className="duration-label">
              <input
                type="radio"
                value="annual"
                checked={selectedDuration === 'annual'}
                onChange={(e) => setSelectedDuration(e.target.value)}
              />
              Annual (Save 17%)
            </label>
          </div>

          <div className="memberships-list">
            {memberships.map((membership, index) => {
              const isCurrentPlan = currentUserMembership === membership.tier.toLowerCase();
              const isPremium = membership.tier === 'Premium';
              
              return (
                <div 
                  className={`membership-card ${isPremium ? 'premium-card' : ''}`}
                  key={index}
                >
                  {isPremium && (
                    <div className="most-popular-badge">Most Popular</div>
                  )}
                  
                  <img 
                    src={membership.image} 
                    alt={`${membership.tier} Membership`} 
                    className="membership-image"
                  />
                  
                  <div className="membership-content">
                    <h2 className="membership-tier">{membership.tier}</h2>
                    <p className="membership-description">{membership.description}</p>
                    
                    <div className="membership-price">
                      {getPrice(membership)}
                    </div>

                    <ul className="benefits-list">
                      {membership.benefits.map((benefit, benefitIndex) => (
                        <li key={benefitIndex} className="benefit-item">
                          <span className="checkmark">✓</span>
                          {benefit}
                        </li>
                      ))}
                    </ul>

                    <button
                      className={`upgrade-button ${isCurrentPlan ? 'current-plan' : ''}`}
                      disabled={isCurrentPlan || loading}
                      onClick={() => handleMembershipChange(membership)}
                    >
                      {getButtonText(currentUserMembership, membership.tier)}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="no-access">
          Please create a customer account to purchase memberships.
        </div>
      )}
    </div>
  );
};

export default Membership;