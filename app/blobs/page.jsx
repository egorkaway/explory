import { Markdown } from 'components/markdown';
import { ShapeEditor } from './editor';
import { ContextAlert } from 'components/context-alert';
import { listBlobs } from './actions';
import { getNetlifyContext, uploadDisabled } from 'utils';
import { useEffect, useState } from 'react';

export const metadata = {
    title: 'Blobs'
};

const explainer = `
[Netlify Blobs](https://docs.netlify.com/blobs/overview/) provides an object store for any kind of data, be it JSON, binary, 
or [really](https://mk.gg/projects/chalkstream) anything else ([really!](https://mk.gg/projects/turbofan)). In this example, the blob store is used to **hold the data of user-generated random blobby shapes**.

Using the blob store is basically zero-config. Below is a Next.js Server Action to upload data (see \`app/blobs/actions.js\`). 
When deployed to Netlify, the Server Action is run by serverless functions, and all context required for the blob service is set-up automatically.

~~~js
'use server';
import { getStore } from '@netlify/blobs';

// TODO: Always be sanitizing data in real sites!
export async function uploadShape({ shapeData }) {
    const blobStore = getStore('shapes');
    const key = data.name;
    await blobStore.setJSON(key, shapeData);
}
~~~

Click "Randomize" to get a shape you like, then hit "Upload".
Choose any existing object to view it.
`;

const uploadDisabledText = `
User uploads are disabled in this site. To run your own and try it out: 
<a href="https://app.netlify.com/start/deploy?repository=https://github.com/netlify-templates/next-platform-starter">
<img src="https://www.netlify.com/img/deploy/button.svg" style="display: inline;" alt="Deploy to Netlify" />
</a>
`;

export default function Page() {
    const [blobs, setBlobs] = useState([]);

    useEffect(() => {
        async function fetchBlobs() {
            try {
                const blobList = await listBlobs();
                setBlobs(blobList);
            } catch (error) {
                console.error('Error fetching blobs:', error);
                setBlobs([]);
            }
        }
        fetchBlobs();
    }, []);

    return (
        <>
            <section className="flex flex-col gap-6 sm:gap-8">
                <ContextAlert
                    addedChecksFunction={(ctx) => {
                        return uploadDisabled ? uploadDisabledText : null;
                    }}
                />
                <h1>Blobs x Blobs</h1>
            </section>
            {!!getNetlifyContext() && (
                <div className="flex flex-col gap-8">
                    <Markdown content={explainer} />
                    <ShapeEditor />
                </div>
            )}
            <section className="flex flex-col gap-8">
                <h2>Available Blobs</h2>
                {blobs.length > 0 ? (
                    <ul>
                        {blobs.map((blob, index) => (
                            <li key={index}>{blob}</li>
                        ))}
                    </ul>
                ) : (
                    <p>No blobs available.</p>
                )}
            </section>
        </>
    );
}