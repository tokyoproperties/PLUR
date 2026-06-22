// Build: 2026-06-21 — PLUR GitHub Pages build
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './pages/Layout';
import AtlasCore from './pages/AtlasCore';
import Biomes from './pages/Biomes';
import Constitution from './pages/Constitution';
import Corridors from './pages/Corridors';
import Cycles from './pages/Cycles';
import Field from './pages/Field';
import Habitats from './pages/Habitats';
import Home from './pages/Home';
import Journal from './pages/Journal';
import LogSighting from './pages/LogSighting';
import Map from './pages/Map';
import NearMe from './pages/NearMe';
import NightMode from './pages/NightMode';
import Search from './pages/Search';
import Seasonal from './pages/Seasonal';
import SeasonDetail from './pages/SeasonDetail';
import MonthDetail  from './pages/MonthDetail';
import Settings from './pages/Settings';
import Sky from './pages/Sky';
import Species from './pages/Species';
import SpeciesDetail from './pages/SpeciesDetail';
import Story from './pages/Story';
import TrailDetail from './pages/TrailDetail';
import HabitatDetail from './pages/HabitatDetail';
import Trails from './pages/Trails';
import WatershedStory from './pages/WatershedStory';
import Yearbook from './pages/Yearbook';
import Stewardship from './pages/Stewardship';
import ImageAudit from './pages/ImageAudit';
import CuratorReview from './pages/CuratorReview';
import TrailAudit from './pages/TrailAudit';

function App() {
  return (
    <BrowserRouter basename="/PLUR">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/home" replace />} />
          <Route path="home"            element={<Home />} />
          <Route path="species"         element={<Species />} />
          <Route path="species/:id"     element={<SpeciesDetail />} />
          <Route path="trails"          element={<Trails />} />
          <Route path="trails/:id"      element={<TrailDetail />} />
          <Route path="map"             element={<Map />} />
          <Route path="seasonal"        element={<Seasonal />} />
          <Route path="seasondetail"    element={<SeasonDetail />} />
          <Route path="monthdetail"     element={<MonthDetail />} />
          <Route path="nearme"          element={<NearMe />} />
          <Route path="journal"         element={<Journal />} />
          <Route path="logsighting"     element={<LogSighting />} />
          <Route path="search"          element={<Search />} />
          <Route path="settings"        element={<Settings />} />
          <Route path="sky"             element={<Sky />} />
          <Route path="story"           element={<Story />} />
          <Route path="corridors"       element={<Corridors />} />
          <Route path="corridors/:id"   element={<Corridors />} />
          <Route path="biomes"          element={<Biomes />} />
          <Route path="biomes/:id"      element={<Biomes />} />
          <Route path="habitats"        element={<Habitats />} />
          <Route path="habitatdetail"   element={<HabitatDetail />} />
          <Route path="cycles"          element={<Cycles />} />
          <Route path="field"           element={<Field />} />
          <Route path="yearbook"        element={<Yearbook />} />
          <Route path="constitution"    element={<Constitution />} />
          <Route path="watershed-story" element={<WatershedStory />} />
          <Route path="core"            element={<AtlasCore />} />
          <Route path="nightmode"       element={<NightMode />} />
          <Route path="stewardship"     element={<Stewardship />} />
          <Route path="imageaudit"      element={<ImageAudit />} />
          <Route path="curatorreview"   element={<CuratorReview />} />
          <Route path="trailaudit"      element={<TrailAudit />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
