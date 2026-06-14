from main import calculate_co2, FootprintInput

def test_carbon_calculation():
    # Setup test input
    inputs = FootprintInput(
        month="2026-06",
        commute_distance=10.0,
        vehicle_type="car",
        fuel_type="petrol",
        public_transport=0.0,
        flights=0,
        electricity=100.0,
        renewables=0.0,
        appliances="moderate",
        diet="vegan",
        meat_freq="never",
        food_source="local",
        fashion_purchases=0,
        electronics_purchases=0,
        online_shopping="never",
        recycling="always",
        composting="always",
        plastic_use="low"
    )

    res = calculate_co2(inputs)
    
    # 1. Transport: 10km * 0.18 kg/km * 30.4 days = 54.72 kg CO2
    assert abs(res["transport"] - 54.72) < 0.1
    
    # 2. Energy: 100 kWh * 0.4 kg/kWh = 40 kg CO2
    assert abs(res["energy"] - 40.0) < 0.1
    
    # 3. Food: (1.5 diet + 0.0 meat + 0.5 source) * 30.4 = 60.8 kg CO2
    assert abs(res["food"] - 60.8) < 0.1
    
    # 4. Shopping: 0.0 kg CO2
    assert res["shopping"] == 0.0
    
    # 5. Waste: base 15 - 8 recycling - 4 composting = 3 kg CO2
    assert res["waste"] == 3.0

    print("All carbon calculation equations verified and correct!")

if __name__ == "__main__":
    test_carbon_calculation()
