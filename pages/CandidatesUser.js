import { Card } from "@/components/Card/Card"; 
import UserNavBar from "../components/NavBar/UserNavBar"

const CandidatesUser = () => {
  const candidatesData = [
    {
      id: 1,
      name: "John Doe",
      desc: "Software Engineer",
      imageAdd: "",
    },
    {
      id: 2,
      name: "Jane Smith",
      desc: "Product Manager",
      imageAdd: "",
    },
    {
      id: 3,
      name: "Alice Johnson",
      desc: "UI/UX Designer",
      imageAdd: "",
    },
    {
      id: 4,
      name: "Alice Johnson",
      desc: "UI/UX Designer",
      imageAdd: "",
    },{
      id: 5,
      name: "Alice Johnson",
      desc: "UI/UX Designer",
      imageAdd: "",
    },{
      id: 6,
      name: "Alice Johnson",
      desc: "UI/UX Designer",
      imageAdd: "",
    },
  ];

  
  return (
    <div className="">
      <UserNavBar/>
      <div className="flex h-screen">
        
      <div className="flex-1 p-6 overflow-auto transition-all duration-300 ml-20 mt-28">


          <div
        className="grid gap-6 grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {candidatesData.map((candidate) => (
                          <Card
                            key={candidate.id}
                            name={candidate.name}
                            desc={candidate.desc}
                            imageUrl={candidate.imageUrl}
                          />
                        ))}
          </div>

        </div>
      </div>
    </div>
  );
};

export default CandidatesUser;
