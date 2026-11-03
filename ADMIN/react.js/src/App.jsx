import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./Login";
import Dashboard from "./DASHBOARD/Dashboard";
import ProtectedRoute from "./ProtectedRoute";

const App = () => {
return ( <BrowserRouter> <Routes>
<Route path="/" element={<Login />} />


    <Route
      path="/dash"
      element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      }
    />
  </Routes>
</BrowserRouter>


);
};

export default App;
