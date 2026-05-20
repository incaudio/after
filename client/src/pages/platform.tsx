import { ReactNode, useMemo, useState } from "react";
import {
  Bell,
  Calendar,
  CheckCircle2,
  FileText,
  LineChart,
  MessageSquare,
  Settings,
  Shield,
  Target,
  Users,
  Wallet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Role = "admin" | "board" | "staff" | "label";
type TabKey = "analytics" | "creative" | "legal" | "finance" | "marketing" | "talent" | "operations" | "board";

const roleTabs: Record<Role, TabKey[]> = {
  admin: ["analytics", "creative", "legal", "finance", "marketing", "talent", "operations", "board"],
  board: ["analytics", "creative", "legal", "finance", "marketing", "talent", "operations", "board"],
  label: ["analytics", "creative", "legal", "finance", "marketing", "talent", "operations"],
  staff: ["analytics", "operations", "marketing"],
};

const roleLabel: Record<Role, string> = {
  admin: "Admin",
  board: "Board Member",
  staff: "Staff",
  label: "Record Label",
};

const tabLabel: Record<TabKey, string> = {
  analytics: "Data Analytics",
  creative: "Creative Control",
  legal: "Legal & Rights",
  finance: "Finance",
  marketing: "Marketing",
  talent: "A&R / Talent",
  operations: "Operations",
  board: "Board",
};

export default function PlatformPage() {
  const [selectedRole, setSelectedRole] = useState<Role>("admin");
  const [activeTab, setActiveTab] = useState<TabKey>("analytics");
  const [email, setEmail] = useState("");
  const tabs = useMemo(() => roleTabs[selectedRole], [selectedRole]);

  return (
    <div className="min-h-screen bg-white px-4 py-6 text-black md:px-6">
      <div className="mx-auto max-w-[1500px]">
        <header className="mb-6 border-2 border-black p-4">
          <h1 className="text-3xl font-bold tracking-tight text-violet-700">Vyronex Label Management</h1>
          <p className="text-sm text-black/70">Square, minimalist operations platform for Admin, Board, Label and Staff workflows.</p>
        </header>

        <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
          <Card className="rounded-none border-2 border-black">
            <CardHeader className="border-b border-black">
              <CardTitle>Role Login</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <Field label="Role">
                <Select
                  value={selectedRole}
                  onValueChange={(v) => {
                    const role = v as Role;
                    setSelectedRole(role);
                    setActiveTab(roleTabs[role][0]);
                  }}
                >
                  <SelectTrigger className="rounded-none border-black">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-none border-black">
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="board">Board Member</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="label">Record Label</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Email">
                <Input className="rounded-none border-black" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@vyronex.com" />
              </Field>

              <Field label="Password">
                <Input className="rounded-none border-black" type="password" placeholder="••••••••" />
              </Field>

              <Button className="w-full rounded-none bg-black text-white hover:bg-violet-900">Sign In</Button>
              <div className="border border-black p-2 text-xs">
                If role mismatch occurs, return: <span className="font-medium">“No user found under selected role”</span> and suggest alternate role.
              </div>

              <div className="border border-black p-2 text-xs">
                <p className="mb-1 font-medium">Role scope</p>
                <ul className="list-disc space-y-1 pl-4">
                  <li>Admin: full platform + user provisioning + staff tab assignment</li>
                  <li>Board: all strategic modules + board room</li>
                  <li>Record Label: own data/contracts + proposals + operations</li>
                  <li>Staff: admin-assigned tabs + private Admin/Board channel</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <section className="border-2 border-black p-4">
            <div className="mb-4 flex items-center justify-between border-b border-black pb-3">
              <div>
                <h2 className="text-xl font-semibold">Dashboard</h2>
                <p className="text-xs text-black/70">Logged as {roleLabel[selectedRole]}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="rounded-none bg-violet-700">{roleLabel[selectedRole]}</Badge>
                <Bell className="h-4 w-4" />
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabKey)}>
              <TabsList className="mb-2 h-auto w-full flex-wrap justify-start rounded-none border border-black bg-white p-1">
                {tabs.map((tab) => (
                  <TabsTrigger key={tab} value={tab} className="rounded-none data-[state=active]:bg-black data-[state=active]:text-white">
                    {tabLabel[tab]}
                    <span className="ml-2 inline-flex h-2 w-2 rounded-none bg-violet-700" />
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="analytics"><AnalyticsModule role={selectedRole} /></TabsContent>
              <TabsContent value="creative"><CreativeModule /></TabsContent>
              <TabsContent value="legal"><LegalModule role={selectedRole} /></TabsContent>
              <TabsContent value="finance"><FinanceModule role={selectedRole} /></TabsContent>
              <TabsContent value="marketing"><MarketingModule role={selectedRole} /></TabsContent>
              <TabsContent value="talent"><TalentModule /></TabsContent>
              <TabsContent value="operations"><OperationsModule role={selectedRole} /></TabsContent>
              <TabsContent value="board"><BoardModule /></TabsContent>
            </Tabs>

            <div className="mt-4 flex items-center justify-between border border-black p-2 text-xs">
              <div className="flex items-center gap-2"><Settings className="h-4 w-4" />Settings (bottom-left in final app shell)</div>
              <span className="text-black/70">Distribution module intentionally omitted</span>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <div><Label>{label}</Label>{children}</div>;
}

function Block({ title, icon: Icon, children }: { title: string; icon: any; children: ReactNode }) {
  return (
    <Card className="mt-4 rounded-none border-2 border-black">
      <CardHeader className="border-b border-black py-3">
        <CardTitle className="flex items-center gap-2 text-base"><Icon className="h-4 w-4 text-violet-700" />{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">{children}</CardContent>
    </Card>
  );
}

function AnalyticsModule({ role }: { role: Role }) {
  return <Block title="Data Analytics" icon={LineChart}><ul className="list-disc space-y-1 pl-4 text-sm"><li>Social engagement per record, monthly editable values</li><li>Audience metrics per record + PDF attachments + graph editing controls</li><li>ROI per record with side-by-side comparison and overall summary</li></ul><p className="mt-3 text-xs">Permission: {role === "label" ? "record label can edit only own record analytics" : "can review all available analytics"}.</p></Block>;
}
function CreativeModule() {
  return <Block title="Creative Control" icon={Users}><ul className="list-disc space-y-1 pl-4 text-sm"><li>New signed artists and existing artists registry</li><li>Add/edit/delete artist profile with socials, email and notes</li><li>Start-empty behavior for first-time setup supported</li></ul></Block>;
}
function LegalModule({ role }: { role: Role }) {
  return <Block title="Legal & Rights" icon={FileText}><ul className="list-disc space-y-1 pl-4 text-sm"><li>Upload contracts (PDF/image/docs) with 50 MB per-file limit</li><li>Bulk upload queue with per-file metadata edits</li><li>Fields: agreement number, type, sign date, expiry date, status</li><li>Statuses: Pending / Signed / Expired</li></ul><p className="mt-3 text-xs">Visibility: {role === "label" ? "show only contracts uploaded by this record label" : "show all contracts"}.</p></Block>;
}
function FinanceModule({ role }: { role: Role }) {
  return <Block title="Finance" icon={Wallet}><ul className="list-disc space-y-1 pl-4 text-sm"><li>Budget proposals submitted by record labels; Admin/Board approval flow</li><li>Payouts ledger for paid budgets and disbursements</li><li>Revenue tracking by board/sub-label/staff categories</li><li>Expenses and total SMG ROI restricted to Admin + Board</li></ul><p className="mt-3 text-xs">Current role access to Expenses + Total ROI: {role === "admin" || role === "board" ? "Allowed" : "Denied"}.</p></Block>;
}
function MarketingModule({ role }: { role: Role }) {
  return <Block title="Marketing" icon={Target}><ul className="list-disc space-y-1 pl-4 text-sm"><li>Sales target per label, monthly</li><li>Content calendar by record/date with save actions</li><li>Ad support request submission from labels</li><li>Social strategy feed with file/link/image posting</li></ul><p className="mt-3 text-xs">Posting limits: Board = 1/week, Record Label = 1/month, Staff = controlled by admin permissions ({roleLabel[role]}).</p></Block>;
}
function TalentModule() {
  return <Block title="A&R / Talent Development" icon={Users}><ul className="list-disc space-y-1 pl-4 text-sm"><li>Potential unsigned artists sheet</li><li>Fields: artist name, email, socials, recommended label tier</li><li>Add/edit entries for sourcing pipeline</li></ul></Block>;
}
function OperationsModule({ role }: { role: Role }) {
  return <Block title="Operations" icon={Calendar}><ul className="list-disc space-y-1 pl-4 text-sm"><li>Deadlines board: tasks, contracts, target due dates</li><li>Public forum communication (no private DMs)</li><li>Notices panel with official announcements + private contact email guidance</li><li>Meeting scheduler (Admin schedules; timezone + link required)</li></ul><p className="mt-3 text-xs">Rule: Board cannot schedule meetings for Admin. {role === "staff" ? "Staff additionally has private Admin/Board channel." : ""}</p></Block>;
}
function BoardModule() {
  return <Block title="Board Room" icon={Shield}><p className="text-sm">Exclusive channel for Board + Admin only.</p><div className="mt-3 grid gap-2 text-xs"><div className="flex items-center gap-2"><MessageSquare className="h-3 w-3" />WhatsApp-like fast thread UI with attachments, links, images</div><div className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3" />Unread indicators (dot badges) on tabs/messages</div></div></Block>;
}
