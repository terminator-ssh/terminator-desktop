import { useState, useEffect } from 'react'
import {Events, WML} from "@wailsio/runtime";
import {GreetService} from "../bindings/terminator-desktop/backend";
import {Button} from "@/components/ui/button.tsx";
import {Input} from "@/components/ui/input.tsx";
import {useTranslation} from "react-i18next";

function App() {
  const { t } = useTranslation()

  const [name, setName] = useState<string>('');
  const [result, setResult] = useState<string>('Please enter your name below 👇');
  const [time, setTime] = useState<string>('Listening for Time event...');

  const doGreet = () => {
    let localName = name;
    if (!localName) {
      localName = 'anonymous';
    }
    GreetService.Greet(localName).then((resultValue: string) => {
      setResult(resultValue);
    }).catch((err: any) => {
      console.log(err);
    });
  }

  useEffect(() => {
    Events.On('time', (timeValue: any) => {
      setTime(timeValue.data);
    });
    // Reload WML so it picks up the wml tags
    WML.Reload();
  }, []);

  return (
      <>
          <div className="h-screen w-screen bg-background text-foreground flex flex-col gap-2 items-center justify-center">
              <h1>Ready: {time}</h1>
              <p>{result}</p>
              <Input className="max-w-sm" value={name} onChange={(e) => setName(e.target.value)} type="text" autoComplete="off"/>
              <Button onClick={doGreet}>{t("greet")}</Button>
          </div>
      </>
  )
}

export default App
