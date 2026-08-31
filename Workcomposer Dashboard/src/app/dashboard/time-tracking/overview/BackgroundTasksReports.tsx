"use client";

import { AiOutlineFileText } from "react-icons/ai";
import { CiCircleCheck } from "react-icons/ci";
import { PiWarning } from "react-icons/pi";
import { Clock3 } from "lucide-react";

type Props = {
  onClose: () => void;
  data: any;
}

export default function BackgroundTasksReports({ onClose, data }: Props) {

  const sessions = data?.sessions || [];


  const workHours = data?.workTime ? (data.workTime / 3600).toFixed(1) : "0.0";
  const breakHours = data?.breakTime ? (data.breakTime / 3600).toFixed(1) : "0.0";
  const screenshots = data?.screenshots ?? 0;
  const deletedCount = data?.deletedCount ?? 0;


  return (
    <>
      <div>
        <div role='dialog' className='relative z-50' aria-modal='true'>
          <div
            onClick={onClose}
            className='fixed inset-0 bg-gray-500/75 transition-opacity'></div>
          <div className='fixed inset-0 z-50 w-screen overflow-y-auto'>
            <div className='flex min-h-full items-center justify-center p-4 text-center sm:p-0'>


              <div
                onClick={(e) =>
                  e.stopPropagation()
                }
                className='w-full max-w-5xl mx-auto transform overflow-hidden rounded-lg bg-white p-6 text-left shadow-xl transition-all'>
                <h2 className='text-lg font-semibold text-gray-900'>Background Tasks and Reports</h2>
                <div className='mt-6 space-y-6'>
                  <div className='text-center'>
                    <div>
                      <div>
                        <h3 className='text-green-600 font-medium my-6'>✔️ {deletedCount} records deleted successfully.</h3>
                      </div>
                    </div>
                  </div>


                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-gray-50 p-3 rounded text-center border">
                      <p className="text-xs text-gray-500">Work Time</p>
                      <p className="font-semibold text-indigo-600">{workHours}h</p>
                    </div>

                    <div className="bg-gray-50 p-3 rounded text-center border">
                      <p className="text-xs text-gray-500">Break Time</p>
                      <p className="font-semibold text-indigo-600">{breakHours}h</p>
                    </div>

                    <div className="bg-gray-50 p-3 rounded text-center border">
                      <p className="text-xs text-gray-500">Screenshots</p>
                      <p className="font-semibold text-indigo-600">{screenshots}</p>
                    </div>
                  </div>

                  <div className='overflow-x-auto'>
                    <table className='min-h-full divide-y divide-gray-200 text-sm'>
                      <thead className='text-left font-medium'>
                        <tr>
                          <th className='px-4 py-3'>Title</th>
                          <th className='px-4 py-3'>Status</th>
                          <th className='px-4 py-3'>Generated</th>
                          <th className='px-4 py-3 text-right'>Actions</th>
                        </tr>
                        
                        

                      </thead>

                      <tbody className='divide-y divide-gray-100'>
                          {sessions.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="text-center py-6 text-gray-500">
                                No records found
                              </td>
                            </tr>
                          ) : (
                            sessions.map((s: any) => {
                              const isError =
                                new Date(s.endTime) > new Date(); // future time check (same logic as your UI)

                              return (
                                <tr key={s._id} className='hover:bg-gray-50'>

                                  {/* TITLE */}
                                  <td className='px-4 py-3 w-1/3'>
                                    <div className='font-medium text-gray-900 flex items-center gap-2'>
                                      {s.type === "work" ? (
                                        <Clock3 className='w-4 h-4 text-gray-400' />
                                      ) : (
                                        <AiOutlineFileText className='w-4 h-4 text-gray-400' />
                                      )}
                                      {s.type === "work" ? "Manual Time Request" : "Delete Time Request"}
                                    </div>

                                    <div className='ml-6 text-sm text-gray-500 mt-1'>
                                      {s.team || "Default team"}
                                      <br />
                                      From: {new Date(s.startTime).toLocaleString()}
                                      <br />
                                      To: {new Date(s.endTime).toLocaleString()}
                                    </div>
                                  </td>

                                  {/* STATUS */}
                                  <td className='px-4 py-3 w-1/3'>
                                    <div className='flex items-center gap-1'>
                                      {isError ? (
                                        <>
                                          <PiWarning className='w-4 h-4 text-red-500' />
                                          <span className='text-gray-700'>
                                            Manual time cannot be added with a future time.
                                          </span>
                                        </>
                                      ) : (
                                        <>
                                          <CiCircleCheck className='w-4 h-4 text-green-600' />
                                          <span className='text-gray-700'>Done</span>
                                        </>
                                      )}
                                    </div>
                                  </td>

                                  {/* DATE */}
                                  <td className='px-4 py-3 text-gray-600'>
                                    {new Date(s.endTime).toLocaleDateString()}
                                  </td>

                                  {/* ACTION */}
                                  <td className='px-4 py-3 text-right flex items-center justify-end space-x-2'>
                                    {isError && (
                                      <button className='cursor-pointer inline-flex items-center px-3 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200'>
                                        Delete
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                    </table>
                  </div>

                  <div className='mt-6 flex justify-center'>
                    <button
                      onClick={onClose}
                      className='cursor-pointer px-4 py-2 rounded bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700'>Close</button>
                  </div>
                </div>


              </div>
            </div>
          </div>
        </div>
      </div >
    </>
  )
}


