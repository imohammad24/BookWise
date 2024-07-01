const fetchMostVisitedCities = async () => {
  try {
    const response = await fetch(`http://10.0.2.2:7183/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: "mohamad.isa.moghrabi@gmail.com",
        password: "12345",
      }),
    });
    //..console.log(response);
  } catch (error) {
    //..console.error("Error fetching most visited cities:", error);
  }
};

fetchMostVisitedCities();
