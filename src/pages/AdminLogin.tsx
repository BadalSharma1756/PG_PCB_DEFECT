import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import PGLogo from "@/components/PGLogo";
import { ADMIN_CREDENTIALS, getLocations } from "@/lib/constants";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const locations = getLocations();

  const handleLogin = () => {
    if (!location || !email || !password) {
      setError("Please fill all fields");
      return;
    }
    const creds = ADMIN_CREDENTIALS[location];
    if (!creds) {
      setError("Invalid location");
      return;
    }
    if (email !== creds.email || password !== creds.password) {
      setError("Invalid email or password for this location");
      return;
    }
    localStorage.setItem("pg_admin_auth", "true");
    localStorage.setItem("pg_admin_location", location);
    localStorage.setItem("pg_admin_email", email);
    navigate("/admin/dashboard");
  };

  // Auto-fill email hint when location changes
  const selectedCreds = location ? ADMIN_CREDENTIALS[location] : null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardContent className="pt-8 pb-8 px-8">
          <div className="flex flex-col items-center mb-6">
            <PGLogo size="lg" />
            <h1 className="mt-4 text-xl font-bold text-foreground">PCB Defect Monitoring</h1>
            <p className="text-sm text-muted-foreground mt-1">Admin Login</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Select Location</Label>
              <Select value={location} onValueChange={(v) => { setLocation(v); setError(""); }}>
                <SelectTrigger>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Select Location" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {locations.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Admin Email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                className="pl-10"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="pl-10"
              />
            </div>

            <Button onClick={handleLogin} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
              Login
            </Button>

            {error && <p className="text-sm text-center text-destructive">{error}</p>}

            {selectedCreds && (
              <div className="text-xs text-center text-muted-foreground space-y-0.5 p-3 rounded-md bg-muted">
                <p className="font-medium">Credentials for {location}:</p>
                <p>Email: {selectedCreds.email}</p>
                <p>Password: {selectedCreds.password}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
