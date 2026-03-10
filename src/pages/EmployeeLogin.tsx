import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BadgeCheck, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import PGLogo from "@/components/PGLogo";
import { createSession } from "@/lib/session";
import { getEmployeeUserByEmployeeId, setEmployeeUserHasLoggedIn } from "@/lib/firestore";
import { getDb } from "@/lib/firebase";

const DefLoc = "Pune";

const EmployeeLogin = () => {
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!employeeId.trim() || !password) {
      setError("Please enter Employee ID and Password");
      return;
    }
    setError("");
    try {
      const db = getDb();
      if (db) {
        const user = await getEmployeeUserByEmployeeId(employeeId.trim());
        if (!user) {
          setError("Invalid Employee ID or not registered by admin. Create user from Admin Panel first.");
          return;
        }
        if (user.password !== password) {
          setError("Invalid password");
          return;
        }
        await setEmployeeUserHasLoggedIn(user.id);
        createSession({
          employeeId: user.employeeId,
          employeeName: user.name,
          location: user.location,
        });
      } else {
        createSession({
          employeeId: employeeId.trim(),
          employeeName: "Employee",
          location: DefLoc,
        });
      }
      navigate("/employee/defect-form");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const isPermission = /permission|denied|unavailable/i.test(msg);
      setError(isPermission ? "Firestore access denied. Deploy Firestore rules (see README)." : `Login failed: ${msg}`);
      console.error("Employee login error", err);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg bg-[hsl(var(--chart-1)/0.06)] border-[hsl(var(--chart-1)/0.2)]">
        <CardContent className="pt-8 pb-8 px-8">
          <div className="flex flex-col items-center mb-6">
            <PGLogo size="lg" />
            <h1 className="mt-4 text-xl font-bold text-foreground">Employee Login</h1>
            <p className="text-sm text-muted-foreground mt-1">Enter your credentials provided by admin</p>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <BadgeCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Employee ID" value={employeeId} onChange={(e) => { setEmployeeId(e.target.value); setError(""); }} className="pl-10" />
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

            <p className="text-xs text-center text-muted-foreground">
              Contact your admin to get login credentials
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeLogin;
