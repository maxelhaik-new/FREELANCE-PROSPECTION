const fs = require('fs');
const file = 'tests/frontend/context/ProspectSearchIntegration.test.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('supabaseProspectService')) {
  content = content.replace(
    "import { ProspectProvider",
    "import { supabaseProspectService } from '../../../src/services/supabaseProspectService';\nimport { ProspectProvider"
  );
}

content = content.replace(
  "beforeEach(() => {",
  "beforeEach(() => {\n    vi.spyOn(supabaseProspectService, 'fetchProspects').mockResolvedValue([]);\n    vi.spyOn(supabaseProspectService, 'fetchProfile').mockResolvedValue(null);\n    vi.spyOn(supabaseProspectService, 'upsertProspects').mockResolvedValue();"
);

fs.writeFileSync(file, content);
