import React, { useState, useEffect } from 'react';
import './Animals.css';

const Animals = () => {
  const [animals, setAnimals] = useState([]);
  const [filteredAnimals, setFilteredAnimals] = useState([]);
  const [filter, setFilter] = useState({ species: '', habitat: '' });
  const [sortOption, setSortOption] = useState('');
  const [favorites, setFavorites] = useState([]);

  // Simulating a fetch call to get animal data
  useEffect(() => {
    const fetchedAnimals = [
      {
        id: 1,
        name: 'Red Panda',
        scientific_name: 'Ailurus fulgens',
        habitat: 'Temperate forests',
        species: 'Mammal',
        fun_fact: 'They use their tails for balance.',
        height: 0.6,
        weight: 5.4,
        date_of_birth: '2015-06-12',
        active: true,
        image: 'https://cdn.zmescience.com/wp-content/uploads/2017/11/Red_Panda_02.jpg',
      },
      {
        id: 2,
        name: 'Axolotl',
        scientific_name: 'Ambystoma mexicanum',
        habitat: 'Freshwater lakes',
        species: 'Amphibian',
        fun_fact: 'They can regenerate their limbs.',
        height: 0.25,
        weight: 0.15,
        date_of_birth: '2020-03-01',
        active: true,
        image: 'https://wallpapers.com/images/hd/cute-axolotl-pictures-sq896b5iufojvfg5.jpg',
      },
      {
        id: 3,
        name: 'Elephant',
        scientific_name: 'Loxodonta africana',
        habitat: 'Savannah, Forests',
        species: 'Mammal',
        fun_fact: 'Elephants are known for their strong memory.',
        height: 3.0,
        weight: 6000,
        date_of_birth: '2005-09-23',
        active: false,
        image: 'https://upload.wikimedia.org/wikipedia/commons/9/99/African_Elephant.jpg',
      },
      {
        id: 4,
        name: 'Blue-Footed Booby',
        scientific_name: 'Sula nebouxii',
        habitat: 'Coastal regions',
        species: 'Bird',
        fun_fact: 'The male booby shows off his blue feet during mating.',
        height: 0.8,
        weight: 1.5,
        date_of_birth: '2012-11-05',
        active: true,
        image: 'https://www.aqua-firma.com/contentFiles/image/2019/09/blue-footed-booby-best-foot-forward-north-seymour-island-galapagos-bird-photograph-ralph-pannell-aqua-firma.jpg',
      },
      {
        id: 5,
        name: 'Gorilla',
        scientific_name: 'Gorilla beringei',
        habitat: 'Tropical forests',
        species: 'Mammal',
        fun_fact: 'Gorillas are the largest living primates.',
        height: 1.7,
        weight: 160,
        date_of_birth: '2010-08-15',
        active: true,
        image: 'https://zooatlanta.org/wp-content/uploads/gorilla_mbeli_ZA_8063.jpg',
      },
      {
        id: 6,
        name: 'Chimpanzee',
        scientific_name: 'Pan troglodytes',
        habitat: 'Tropical rainforests',
        species: 'Mammal',
        fun_fact: 'Chimpanzees use tools like sticks to find food.',
        height: 1.2,
        weight: 50,
        date_of_birth: '2012-02-10',
        active: true,
        image: 'https://www.thoughtco.com/thmb/h02o5Nkn4HEQU8EOBYGxq7gosrA=/5400x3600/filters:no_upscale():max_bytes(150000):strip_icc()/chimpanzee---pan-troglodytes-troglodytes--831042278-5a5e4c81b39d03003785777f.jpg',
      },
      {
        id: 7,
        name: 'Tiger',
        scientific_name: 'Panthera tigris',
        habitat: 'Tropical forests, Grasslands',
        species: 'Mammal',
        fun_fact: 'Tigers are excellent swimmers.',
        height: 1.1,
        weight: 220,
        date_of_birth: '2017-05-21',
        active: false,
        image: 'https://conservationnation.org/wp-content/uploads/2020/02/bengal-tiger-hero.jpg',
      },
      {
        id: 8,
        name: 'White Lion',
        scientific_name: 'Panthera leo',
        habitat: 'Savannah, Grasslands',
        species: 'Mammal',
        fun_fact: 'Lions are known for their powerful roars.',
        height: 1.2,
        weight: 190,
        date_of_birth: '2015-11-08',
        active: true,
        image: 'https://images.hdqwalls.com/wallpapers/white-lion-sd.jpg',
      },
      {
        id: 9,
        name: 'Zebra',
        scientific_name: 'Equus quagga',
        habitat: 'Savannah',
        species: 'Mammal',
        fun_fact: 'Zebras have unique stripe patterns.',
        height: 1.5,
        weight: 350,
        date_of_birth: '2013-09-17',
        active: true,
        image: 'https://images.ctfassets.net/cnu0m8re1exe/w4TS6ONjG71UXC3pkZDLc/5f162a88da4bebf9a9d29a867205b795/Zebra.jpg',
      },
      {
        id: 10,
        name: 'Black Spider Monkey',
        scientific_name: 'Ateles fusciceps',
        habitat: 'Tropical forests',
        species: 'Mammal',
        fun_fact: 'Spider monkeys have prehensile tails.',
        height: 0.9,
        weight: 9,
        date_of_birth: '2016-06-02',
        active: false,
        image: 'https://i.natgeofe.com/k/843004bd-bf56-49d1-8c28-9b7e0af87bbd/spider-monkey-tail-35785462_3x4.jpg',
      },
      {
        id: 11,
        name: 'Polar Bear',
        scientific_name: 'Ursus maritimus',
        habitat: 'Arctic regions',
        species: 'Mammal',
        fun_fact: 'Polar bears have black skin under their white fur.',
        height: 2.4,
        weight: 450,
        date_of_birth: '2011-12-25',
        active: true,
        image: 'https://cff2.earth.com/uploads/2023/04/10232809/Polar-bear-scaled.jpg',
      },
      {
        id: 12,
        name: 'Red Fox',
        scientific_name: 'Vulpes vulpes',
        habitat: 'Forests, Grasslands',
        species: 'Mammal',
        fun_fact: 'Red foxes can jump high fences.',
        height: 0.4,
        weight: 7,
        date_of_birth: '2019-04-30',
        active: true,
        image: 'https://greenerideal.com/wp-content/uploads/2013/05/fox.jpg',
      }
    ];
    setAnimals(fetchedAnimals);
    setFilteredAnimals(fetchedAnimals);
  }, []);

  // Filtering logic based on species and habitat
  const filterAnimals = () => {
    let filtered = animals.filter((animal) => {
      return (
        (filter.species === '' || animal.species === filter.species) &&
        (filter.habitat === '' || animal.habitat.includes(filter.habitat))
      );
    });

    if (sortOption === 'height') {
      filtered.sort((a, b) => a.height - b.height);
    } else if (sortOption === 'weight') {
      filtered.sort((a, b) => a.weight - b.weight);
    } else if (sortOption === 'birthdate') {
      filtered.sort((a, b) => new Date(a.date_of_birth) - new Date(b.date_of_birth));
    }

    setFilteredAnimals(filtered);
  };

  // Handling the change of filter inputs and sorting options
  const handleFilterChange = (e) => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  };

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  return (
    <div className="animals-container">
      <div className="filter-section">
        <h3>Filter Animals</h3>
        <label>
          Species:
          <input
            type="text"
            name="species"
            value={filter.species}
            onChange={handleFilterChange}
            placeholder="Enter species"
          />
        </label>
        <label>
          Habitat:
          <input
            type="text"
            name="habitat"
            value={filter.habitat}
            onChange={handleFilterChange}
            placeholder="Enter habitat"
          />
        </label>
        <label>
          Sort by:
          <select value={sortOption} onChange={handleSortChange}>
            <option value="">Select an option</option>
            <option value="height">Height</option>
            <option value="weight">Weight</option>
            <option value="birthdate">Date of Birth</option>
          </select>
        </label>
        <button onClick={filterAnimals}>Apply Filters</button>
      </div>

      <div className="animals-list">
        {filteredAnimals.map((animal) => (
          <div key={animal.id} className="animal-card">
            <img src={animal.image} alt={animal.name} />
            <h4>{animal.name}</h4>
            <p><strong>Scientific Name:</strong> {animal.scientific_name}</p>
            <p><strong>Habitat:</strong> {animal.habitat}</p>
            <p><strong>Species:</strong> {animal.species}</p>
            <p><strong>Fun Fact:</strong> {animal.fun_fact}</p>
            <p><strong>Height:</strong> {animal.height} m</p>
            <p><strong>Weight:</strong> {animal.weight} kg</p>
            <p><strong>Date of Birth:</strong> {new Date(animal.date_of_birth).toDateString()}</p>
            <p><strong>Currently Active:</strong> {animal.active ? 'Yes' : 'No'}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Animals;