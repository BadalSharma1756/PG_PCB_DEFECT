import { useState } from "react";
import { User, Mail, BadgeCheck, Factory } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PGLogo from "@/components/PGLogo";
import { PLANTS } from "@/lib/constants";

const EmployeeRegistration = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [plant, setPlant] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!name || !email || !employeeId || !plant) return;
    // In production, this would write to Firestore
    setSubmitted(true);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardContent className="pt-8 pb-8 px-8">
          <div className="flex flex-col items-center mb-6">
            <PGLogo size="lg" />
            <h1 className="mt-4 text-xl font-bold text-foreground">Employee Registration</h1>
            <p className="text-sm text-muted-foreground mt-1">Register to submit defect entries</p>
          </div>

          {submitted ? (
            <div className="rounded-lg bg-[hsl(199,89%,95%)] p-6 text-center">
              <p className="font-semibold text-[hsl(199,89%,35%)]">Request Submitted!</p>
              <p className="text-sm text-[hsl(199,89%,40%)] mt-1">
                Please wait for admin approval. Approval is valid for 12 hours after being granted.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Employee Name" value={name} onChange={(e) => setName(e.target.value)} className="pl-10" />
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Employee Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" />
              </div>
              <div className="relative">
                <BadgeCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Employee ID" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} className="pl-10" />
              </div>
              <div className="relative">
                <Factory className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Select value={plant} onValueChange={setPlant}>
                  <SelectTrigger className="pl-10">
                    <SelectValue placeholder="Select Plant" />
                  </SelectTrigger>
                  <SelectContent>
                    {PLANTS.map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSubmit} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                Submit Request
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeRegistration;
