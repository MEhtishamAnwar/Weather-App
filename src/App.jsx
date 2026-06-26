import { useCallback, useEffect, useState } from 'react'
import WeatherBackground from './components/WeatherBackground'
import { convertTemperature, getHumidityValue, getVisibilityValue } from './components/Helper.jsx'
import { HumidityIcon, SunriseIcon, SunsetIcon, VisibilityIcon, WindIcon } from './components/Icons.jsx'
const App = () => {
const API_KEY= import.meta.env.VITE_WEATHER_API_KEY;
// https://api.openweathermap.org/data/2.5/weather?lat=${s.lat}&lon=${s.lon}&appid={API_KEY}&units=metric`;
  const [weather, setWeather] = useState(null)
  const [city, setCity] = useState("")
  const [suggestion, setSuggestion] = useState([])
  const [unit, setUnit] = useState('C')
  const [error, setError] = useState('')
  const [weatherCondition, setWeatherCondition] = useState(null)

  const fetchSuggestions= useCallback(async (query)=>{
    try{
      const res= await fetch(
        `http://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${API_KEY}`
      );
      res.ok ? setSuggestion(await res.json()): setSuggestion([])
    }
    catch{
      setSuggestion([]);
    }
  }, [API_KEY])

  useEffect(()=>{
    if(city.trim().length>=3&&  !weather){
      const timer=setTimeout(()=> fetchSuggestions(city),500)
      return ()=> clearTimeout(timer);
    }
  },[city,weather,fetchSuggestions])

  const fetchWeatherData = async (url,name='')=>{
    setError('');
    setWeather(null);
    setWeatherCondition(null);
    try{
      const response=await fetch(url)
      if(!response.ok) throw new  Error((await response.json()).message|| 'City not found')
       const data =await response.json();
      const currentTime = Date.now() / 1000;
      setWeatherCondition({
        main: data.weather[0].main,
        isDay: currentTime > data.sys.sunrise && currentTime < data.sys.sunset
      });
      setWeather(data);
      setCity(name||data.name)
      setSuggestion([]);

      }
      catch (error){
        setError(error.message )

      }
  }
  const handleSearch= async (e)=>{
    e.preventDefault();
    if(!city.trim()) return setError("Please enter the valid name.");
    await fetchWeatherData(
      `https://api.openweathermap.org/data/2.5/weather?q=${city.trim()}&appid=${API_KEY}&units=metric`
    )
  }
  const handleCityChange = (e) => {
    const value = e.target.value;
    setCity(value);
    if (value.trim().length < 3) setSuggestion([]);
  }
  return (
    <div className='min-h-screen w-full '>
      <WeatherBackground condition={weatherCondition}/>
      <div className="flex items-center justify-center px-3 py-4 sm:px-4 sm:py-6 min-h-screen w-full ">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-4 sm:p-6 md:p-8 w-full max-w-lg md:max-w-xl lg:max-w-1xl xl:max-w-1xl xl:h-fit text-white border border-white/20 shadow-2xl shadow-black/30 relative z-10 leading-1.5">
        <h1 className='text-2xl sm:text-3xl font-extrabold text-center mb-4 sm:mb-6'>
          Weather App
        </h1>
        {!weather ? (
          <form onSubmit={handleSearch} className='flex flex-col relative gap-3' action="">
            <input
              type="text"
              value={city}
              onChange={handleCityChange}
              placeholder='Enter City or Country (min 3 letters)'
              className='w-full mb-2 p-3 rounded-xl border border-white/40 bg-white/10 text-white placeholder-white/70 focus:outline-none focus:border-blue-300 focus:bg-white/20 transition duration-300'
            />
            {suggestion.length > 0 && (
              <div className="absolute top-12 left-0 right-0 bg-transparent shadow-md rounded z-10">
                {suggestion.map((s) => (
                  <button
                    key={`${s.lat}-${s.lon}`}
                    type='button'
                    onClick={() => fetchWeatherData(
                      `https://api.openweathermap.org/data/2.5/weather?lat=${s.lat}&lon=${s.lon}&appid=${API_KEY}&units=metric`,
                      `${s.name}, ${s.country}${s.state ? `, ${s.state}` : ""}`
                    )}
                    className='block hover:bg-blue-700 bg-transparent px-4 py-2 text-sm text-left w-full transition-colors '
                  >
                    {s.name}, {s.country}{s.state && `, ${s.state}`}
                  </button>
                ))}
              </div>
            )}
            <button type="submit" className='w-full sm:w-auto bg-purple-700 hover:bg-purple-800 text-white font-semibold py-2 px-4 rounded-2xl transition-colors'>
              Get Weather
            </button>
          </form>
        ) : (
          <div className="mt-2 sm:mt-4 text-center transition-opacity duration-500 ">
            <button onClick={() => { setWeather(null); setWeatherCondition(null); setCity(''); setSuggestion([]) }} className='mb-4 bg-purple-900 hover:bg-blue-700 text-white font-semibold py-2 px-3 rounded-xl transition-colors'>
              New Search
            </button>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <h2 className='text-2xl sm:text-3xl font-bold'>
                {weather.name}
              </h2>
              <button onClick={()=>setUnit(u=> u==='C'? 'F':'C')} className='self-start sm:self-auto bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2 px-3 rounded-xl transition-colors'>
                &deg;{unit}

              </button>
            </div>
            <img src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`} alt={weather.weather[0].description} 
             className='mx-auto my-4 animate-bounce'/>
             <p className='text-3xl sm:text-4xl'>
              {convertTemperature(weather.main.temp,unit)}  &deg;{unit}

             </p>
             <p className='capitalize '>
              {weather.weather[0].description}

             </p>
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
              {[
                [HumidityIcon,"Humitity",`${weather.main.humidity}%
                  (${getHumidityValue(weather.main.humidity)})`],
                  
                  [WindIcon,"Wind",`${weather.wind.speed}m/s ${weather.wind.deg? `(${getHumidityValue(weather.main.humidity)})`:""}
                 `],

                  [VisibilityIcon,"Visibiity",getVisibilityValue(weather.visibility)]
              ].map(([Icon,lable,value])=>(
                <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-white/10" key={lable}>
                  <Icon/>
                  <p className='mt-1 font-semibold '>{lable}</p>
                  <p className='text-sm '>{value}</p>
                </div>
              ))}

             </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">

              {[
                [SunriseIcon,"Sunrise",weather.sys.sunrise],
                [SunsetIcon,"Sunset",weather.sys.sunset]
              ].map(([Icon,lable,time])=>(
                <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-white/10" key={lable}>
                      <Icon/>
                  <p className='mt-1 font-semibold '>{lable}</p>
                  <p className='text-sm '>
                    {new Date(time*1000).toLocaleDateString("en-GB",
                      {hour:"2-digit",minute:"2-digit"}
                    )}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 text-sm space-y-1 text-left sm:text-center">
              <p><strong>Feel Like:</strong>{convertTemperature(weather.main.feels_like,unit)} &deg;{unit}</p>
              <p><strong>Pressure:</strong>{weather.main.pressure}hPa</p>
            </div>
          </div>
        )}
        {error && <p className='text-red-500 text-center mt-4'>{error}</p>}
        </div>
      </div>
    </div>
  )
}

export default App
