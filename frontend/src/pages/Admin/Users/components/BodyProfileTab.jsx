/**
 * ADMIN MODULE — Body Profile Tab
 *
 * The patient's body profile, laid out with this program's points (set by
 * the super admin in Configuration → Body Profile). Answers outside that
 * list show under "Other answers". Empty state if no data yet.
 */

import BodyProfileView from "../../../../components/common/BodyProfileView";
import { PROGRAM_ID } from "../../../../utils/programConfig";

const BodyProfileTab = ({ bodyProfile }) => {
  if (!bodyProfile) return <BodyProfileView bodyProfile={null} />;

  return (
    <div
      className="
        bg-white rounded-2xl border border-gray-100
        shadow-[0_1px_3px_rgba(16,24,40,0.04)]
        p-5 sm:p-6
      "
    >
      <BodyProfileView bodyProfile={bodyProfile} programId={PROGRAM_ID} />
    </div>
  );
};

export default BodyProfileTab;
