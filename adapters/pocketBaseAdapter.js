export const createPocketBaseAdapter = ({ pb }) => {
  if (!pb) {
    throw new Error("PocketBase client is required to create the PocketBase adapter.");
  }

  return {
    name: "pocketbase",

    async load() {
      const [
        users,
        professionals,
        patients,
        treatments,
        resources,
        plans,
        appointments,
        histories,
        requests,
        payments,
      ] = await Promise.all([
        pb.collection("app_users").getFullList(),
        pb.collection("professionals").getFullList(),
        pb.collection("patients").getFullList(),
        pb.collection("treatments").getFullList(),
        pb.collection("resources").getFullList(),
        pb.collection("treatment_plans").getFullList(),
        pb.collection("appointments").getFullList(),
        pb.collection("clinical_history").getFullList(),
        pb.collection("appointment_requests").getFullList(),
        pb.collection("payments").getFullList(),
      ]);

      return {
        currentUserId: "",
        activeView: "dashboard",
        selectedPatientId: patients[0]?.id ?? "",
        selectedSegment: "all",
        users,
        professionals,
        patients,
        treatments,
        resources,
        plans,
        appointments,
        histories,
        requests,
        payments,
      };
    },

    async save() {
      throw new Error("Use targeted PocketBase operations instead of saving the full state object.");
    },
  };
};
