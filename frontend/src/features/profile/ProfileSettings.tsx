import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import Container from "../../components/basic/Container";
import Button from "../../components/basic/Button";
import useProfile from "../../hooks/useProfile";
import useForm from "../../hooks/useForm";
import axios from "axios";

interface Props {}

export const ProfileSettings: React.FC<Props> = () => {
  const user = useProfile();
  const history = useHistory();
  const required_support_level = 5;
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const { inputs, handleSubmit, handleInputChange, setInputs } = useForm(async () => {
    var valid = true;
    [inputs.background_url, inputs.player_back_url, inputs.encounter_back_url].forEach((str) => {
      if (str && !str.endsWith(".png") && !str.endsWith(".jpg")) valid = false;
    })
    if (!valid) {
      setErrorMessage("All images must be .jpg or .png");
      return;
    }
    const data = {
      user: {
        id: user?.id,
        background_url: inputs.background_url,
        player_back_url: inputs.player_back_url,
        encounter_back_url: inputs.encounter_back_url,
      },
    };
    const res = await axios.post("/be/api/v1/profile/update", data);
    if (
      res.status === 200
    ) {
      setSuccessMessage("Settings updated. Changes will take effect next time you log in.");
      setErrorMessage("");
    } else {
      setSuccessMessage("");
      setErrorMessage("Error.");
    }
    
  });
  useEffect(() => {
    if (user) {
      setInputs((inputs) => ({
        ...inputs,
        background_url: user.background_url || "",
        player_back_url: user.player_back_url || "",
        encounter_back_url: user.encounter_back_url || "",
      }));
    }
  }, [user]);
  if (user == null) {
    return null;
  }
  console.log('Rendering ProfileSettings');
  return (
    <Container>
      <div className="bg-gray-100 p-4 rounded max-w-xl shadow">
      <h1 className="font-semibold mb-4 text-black">Customization</h1>
      <form action="POST" onSubmit={handleSubmit}>
        <fieldset>
          <div className="mb-4">
            <label className="block text-sm font-bold mb-2">
              Background image url
            </label>
            <input
              disabled={user.supporter_level < required_support_level}
              name="background_url"
              className="form-control w-full"
              onChange={handleInputChange}
              value={inputs.background_url || ""}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-bold mb-2">
              Player card back image url
            </label>
            <input
              disabled={user.supporter_level < required_support_level}
              name="player_back_url"
              className="form-control w-full"
              onChange={handleInputChange}
              value={inputs.player_back_url || ""}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-bold mb-2">
              Encounter card back image url
            </label>
            <input
              disabled={user.supporter_level < required_support_level}
              name="encounter_back_url"
              className="form-control w-full"
              onChange={handleInputChange}
              value={inputs.encounter_back_url || ""}
            />
          </div>
          <div className="flex items-center justify-between">
            {user.supporter_level < required_support_level ?
              <Button isPrimary className="mx-2 mt-2">
                <img className="inline-block h-5 w-5 mr-2" src="https://upload.wikimedia.org/wikipedia/commons/9/94/Patreon_logo.svg"/>
                <a className="text-white no-underline" href="https://www.patreon.com/dragncards">Unlock</a>
              </Button>
              :
              <Button isSubmit isPrimary className="mx-2">
                Update
              </Button>
            }
          </div>
        </fieldset>
      </form>
      {errorMessage && (
        <div className="alert alert-danger mt-4">{errorMessage}</div>
      )}
      {successMessage && (
        <div className="alert alert-info mt-4">{successMessage}</div>
      )}
      </div>
    </Container>

  );
};
export default ProfileSettings;
